using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using SharedKernel.Events;

namespace Hinet.Service.RabbitMQ
{
    public interface IEventLogService
    {
        void LogEvent(EventLogItem item);
        List<EventLogItem> GetRecentLogs(int count = 50);
        void ClearLogs();
    }

    public class EventLogService : IEventLogService
    {
        private static readonly List<EventLogItem> _logs = new();
        private static readonly object _lock = new();

        public void LogEvent(EventLogItem item)
        {
            lock (_lock)
            {
                _logs.Insert(0, item);
                if (_logs.Count > 200)
                {
                    _logs.RemoveAt(_logs.Count - 1);
                }
            }
        }

        public List<EventLogItem> GetRecentLogs(int count = 50)
        {
            lock (_lock)
            {
                return _logs.Take(count).ToList();
            }
        }

        public void ClearLogs()
        {
            lock (_lock)
            {
                _logs.Clear();
            }
        }
    }

    public interface IRabbitMQPublisher
    {
        void PublishUserCreated(UserCreatedEvent evt);
        void PublishUserUpdated(UserUpdatedEvent evt);
        void PublishUserRolesChanged(UserRolesChangedEvent evt);
        void PublishDepartmentCreated(DepartmentCreatedEvent evt);
        void PublishDepartmentUpdated(DepartmentUpdatedEvent evt);
        void PublishDepartmentDeleted(DepartmentDeletedEvent evt);
    }

    public class RabbitMQPublisher : IRabbitMQPublisher, IDisposable
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<RabbitMQPublisher> _logger;
        private readonly IEventLogService _eventLogService;
        private IConnection? _connection;
        private IModel? _channel;
        private readonly object _lock = new object();

        public RabbitMQPublisher(
            IConfiguration configuration,
            ILogger<RabbitMQPublisher> logger,
            IEventLogService eventLogService)
        {
            _configuration = configuration;
            _logger = logger;
            _eventLogService = eventLogService;
        }

        private void EnsureConnectionAndChannel()
        {
            if (_connection != null && _connection.IsOpen && _channel != null && _channel.IsOpen)
                return;

            lock (_lock)
            {
                if (_connection != null && _connection.IsOpen && _channel != null && _channel.IsOpen)
                    return;

                var host = _configuration["RabbitMQ:HostName"] ?? "localhost";
                var port = int.Parse(_configuration["RabbitMQ:Port"] ?? "5672");
                var user = _configuration["RabbitMQ:UserName"] ?? "guest";
                var pass = _configuration["RabbitMQ:Password"] ?? "guest";

                var factory = new ConnectionFactory
                {
                    HostName = host,
                    Port = port,
                    UserName = user,
                    Password = pass,
                    AutomaticRecoveryEnabled = true,
                    NetworkRecoveryInterval = TimeSpan.FromSeconds(5),
                    RequestedHeartbeat = TimeSpan.FromSeconds(30),
                    ClientProvidedName = $"IdentityService-Publisher-{Environment.MachineName}"
                };

                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                _channel.ExchangeDeclare(
                    exchange: RabbitMQConstants.UserExchange,
                    type: ExchangeType.Topic,
                    durable: true,
                    autoDelete: false,
                    arguments: null);

                _logger.LogInformation("✅ [RabbitMQ Publisher] Connected to RabbitMQ at {Host}:{Port}, Exchange '{Exchange}' declared", host, port, RabbitMQConstants.UserExchange);
            }
        }

        private void Publish<T>(string routingKey, T payload, string eventType)
        {
            var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions { WriteIndented = true });
            
            _eventLogService.LogEvent(new EventLogItem
            {
                EventType = eventType,
                RoutingKey = routingKey,
                Payload = json,
                Status = "Published to RabbitMQ",
                Timestamp = DateTime.UtcNow,
                Source = "identity-service",
                Consumers = new List<string> { "asset-service", "kpi-service" }
            });

            try
            {
                EnsureConnectionAndChannel();
                if (_channel == null || !_channel.IsOpen)
                {
                    _logger.LogWarning("⚠️ [RabbitMQ Publisher] Channel not open. Event '{EventType}' logged locally.", eventType);
                    return;
                }

                lock (_lock)
                {
                    var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload));
                    var properties = _channel.CreateBasicProperties();
                    properties.Persistent = true;
                    properties.ContentType = "application/json";
                    properties.Type = eventType;
                    properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

                    _channel.BasicPublish(
                        exchange: RabbitMQConstants.UserExchange,
                        routingKey: routingKey,
                        basicProperties: properties,
                        body: body);

                    _logger.LogInformation("🚀 [RabbitMQ Publisher] Broadcasted '{EventType}' to Exchange '{Exchange}' with RoutingKey '{RoutingKey}'",
                        eventType, RabbitMQConstants.UserExchange, routingKey);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("⚠️ [RabbitMQ Publisher] Could not publish '{EventType}' to RabbitMQ: {Msg}. (Fallback: Event stored in memory for demo)", eventType, ex.Message);
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

        public void PublishUserCreated(UserCreatedEvent evt)
        {
            Publish(RabbitMQConstants.UserCreatedRoutingKey, evt, nameof(UserCreatedEvent));
        }

        public void PublishUserUpdated(UserUpdatedEvent evt)
        {
            Publish(RabbitMQConstants.UserUpdatedRoutingKey, evt, nameof(UserUpdatedEvent));
        }

        public void PublishUserRolesChanged(UserRolesChangedEvent evt)
        {
            Publish(RabbitMQConstants.UserRolesChangedRoutingKey, evt, nameof(UserRolesChangedEvent));
        }

        public void PublishDepartmentCreated(DepartmentCreatedEvent evt)
        {
            Publish(DepartmentRabbitMQConstants.DepartmentCreatedRoutingKey, evt, nameof(DepartmentCreatedEvent));
        }

        public void PublishDepartmentUpdated(DepartmentUpdatedEvent evt)
        {
            Publish(DepartmentRabbitMQConstants.DepartmentUpdatedRoutingKey, evt, nameof(DepartmentUpdatedEvent));
        }

        public void PublishDepartmentDeleted(DepartmentDeletedEvent evt)
        {
            Publish(DepartmentRabbitMQConstants.DepartmentDeletedRoutingKey, evt, nameof(DepartmentDeletedEvent));
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
