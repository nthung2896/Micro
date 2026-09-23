using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Hinet.Worker.AuditLog
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly IConfiguration _configuration;
        private readonly Microsoft.Extensions.DependencyInjection.IServiceScopeFactory _scopeFactory;
        private IConnection _connection;
        private IModel _channel;
        private readonly string _queueName;

        public Worker(
            ILogger<Worker> logger, 
            IConfiguration configuration,
            Microsoft.Extensions.DependencyInjection.IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _configuration = configuration;
            _scopeFactory = scopeFactory;


            
            _queueName = _configuration["RabbitMQ:QueueName"] ?? "audit_logs_queue";
            InitRabbitMQ();
        }

        private void InitRabbitMQ()
        {
            
            var factory = new ConnectionFactory
            {
                HostName = _configuration["RabbitMQ:HostName"],
                Port = int.Parse(_configuration["RabbitMQ:Port"] ?? "5672"),
                UserName = _configuration["RabbitMQ:UserName"],
                Password = _configuration["RabbitMQ:Password"],
                AutomaticRecoveryEnabled = true,
                NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
                RequestedHeartbeat = TimeSpan.FromSeconds(30),
                ClientProvidedName = $"WorkerAuditLog-{Environment.MachineName}"
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            _channel.QueueDeclare(
                queue: _queueName,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            stoppingToken.ThrowIfCancellationRequested();

            var consumer = new EventingBasicConsumer(_channel);

            consumer.Received += async (ch, ea) =>
            {

                try
                {
                    var content = Encoding.UTF8.GetString(ea.Body.ToArray());
                    _logger.LogInformation("[AuditLog Worker] 📨 Nhận Audit Log từ RabbitMQ: {content}", content);

                    var auditItem = System.Text.Json.JsonSerializer.Deserialize<Hinet.Model.Entities.Audit>(content);
                    if (auditItem != null)
                    {
                        using var scope = _scopeFactory.CreateScope();
                        var dbContext = scope.ServiceProvider.GetRequiredService<Hinet.Model.HinetContext>();

                        await dbContext.Audit.AddAsync(auditItem, stoppingToken);
                        await dbContext.SaveChangesAsync(stoppingToken);

                        _logger.LogInformation("[AuditLog Worker] ✅ Đã lưu Audit Log thành công vào CSDL (AuditID: {AuditID})", auditItem.AuditID);
                    }

                    _channel.BasicAck(ea.DeliveryTag, false);

                }
                catch (System.Exception ex)
                {
                    _logger.LogError(ex, "[AuditLog Worker] ❌ Lỗi khi xử lý lưu Audit Log");
                    _channel.BasicNack(ea.DeliveryTag, false, false);
                }
            };

            _channel.BasicConsume(_queueName, false, consumer);

            return Task.CompletedTask;
        }

        public override void Dispose()
        {
            _channel.Close();
            _connection.Close();
            base.Dispose();
        }
    }
}
