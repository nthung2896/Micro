using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using System;
using System.Text;
using System.Text.Json;

namespace Hinet.Service.RabbitMQ
{
    public class RabbitMQService : IRabbitMQService, IDisposable
    {
        private readonly IConfiguration _configuration;
        private IConnection? _connection;
        private IModel? _channel;
        private readonly object _lock = new object();

        public RabbitMQService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private void EnsureConnectionAndChannel()
        {
            if (_connection != null && _connection.IsOpen && _channel != null && _channel.IsOpen)
                return;

            lock (_lock)
            {
                if (_connection != null && _connection.IsOpen && _channel != null && _channel.IsOpen)
                    return;

                var host = _configuration["RabbitMQ:HostName"];
                if (string.IsNullOrEmpty(host)) return;

                var factory = new ConnectionFactory
                {
                    HostName = host,
                    Port = int.Parse(_configuration["RabbitMQ:Port"] ?? "5672"),
                    UserName = _configuration["RabbitMQ:UserName"],
                    Password = _configuration["RabbitMQ:Password"],
                    AutomaticRecoveryEnabled = true,
                    NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
                    RequestedHeartbeat = TimeSpan.FromSeconds(30),
                    ClientProvidedName = $"API-{Environment.MachineName}"
                };

                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();
            }
        }

        public void SendMessage<T>(T message, string queueName)
        {
            try
            {
                EnsureConnectionAndChannel();
                if (_channel == null || !_channel.IsOpen) return;

                lock (_lock)
                {
                    _channel.QueueDeclare(
                        queue: queueName,
                        durable: true,
                        exclusive: false,
                        autoDelete: false,
                        arguments: null);

                    var jsonMessage = JsonSerializer.Serialize(message);
                    var body = Encoding.UTF8.GetBytes(jsonMessage);

                    var properties = _channel.CreateBasicProperties();
                    properties.Persistent = true;

                    _channel.BasicPublish(
                        exchange: "",
                        routingKey: queueName,
                        basicProperties: properties,
                        body: body);
                }
            }
            catch
            {
                // Nếu lỗi kết nối, reset lại connection/channel để khôi phục ở lần sau
                try
                {
                    _channel?.Dispose();
                    _connection?.Dispose();
                }
                catch { }
                _channel = null;
                _connection = null;
            }
        }

        public void Dispose()
        {
            try
            {
                _channel?.Dispose();
                _connection?.Dispose();
            }
            catch { }
        }
    }
}
