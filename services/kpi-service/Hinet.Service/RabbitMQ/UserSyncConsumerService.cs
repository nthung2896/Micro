using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Hinet.Model.Entities;
using Hinet.Repository;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Hinet.Service.RabbitMQ
{
    public class UserSyncConsumerService : BackgroundService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserSyncConsumerService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private IConnection? _connection;
        private IModel? _channel;

        private const string UserExchange = "user.events.exchange";
        private const string KpiQueue = "kpi.service.user.sync";

        public UserSyncConsumerService(
            IConfiguration configuration,
            ILogger<UserSyncConsumerService> logger,
            IServiceScopeFactory scopeFactory)
        {
            _configuration = configuration;
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🚀 [KpiService - RabbitMQ Consumer] Starting UserSyncConsumer background service...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    if (TryConnectAndConsume(stoppingToken))
                    {
                        await Task.Delay(Timeout.Infinite, stoppingToken);
                    }
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("⚠️ [KpiService - RabbitMQ Consumer] Connection lost or not available: {Msg}. Retrying in 10s...", ex.Message);
                    Cleanup();
                    try
                    {
                        await Task.Delay(10000, stoppingToken);
                    }
                    catch (OperationCanceledException)
                    {
                        break;
                    }
                }
            }

            Cleanup();
            _logger.LogInformation("🛑 [KpiService - RabbitMQ Consumer] Background service stopped.");
        }

        private bool TryConnectAndConsume(CancellationToken stoppingToken)
        {
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
                NetworkRecoveryInterval = TimeSpan.FromSeconds(10),
                ClientProvidedName = $"KpiService-UserConsumer-{Environment.MachineName}"
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            // 1. Declare Exchange
            _channel.ExchangeDeclare(
                exchange: UserExchange,
                type: ExchangeType.Topic,
                durable: true,
                autoDelete: false,
                arguments: null);

            // 2. Declare Queue
            _channel.QueueDeclare(
                queue: KpiQueue,
                durable: true,
                exclusive: false,
                autoDelete: false,
                arguments: null);

            // 3. Bind Queue to Exchange with routing key 'user.#'
            _channel.QueueBind(
                queue: KpiQueue,
                exchange: UserExchange,
                routingKey: "user.#",
                arguments: null);

            _channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

            var consumer = new EventingBasicConsumer(_channel);
            consumer.Received += (sender, ea) =>
            {
                try
                {
                    var body = ea.Body.ToArray();
                    var message = Encoding.UTF8.GetString(body);
                    var routingKey = ea.RoutingKey;

                    _logger.LogInformation("📥 [KpiService - RabbitMQ] Received event '{RoutingKey}': {Body}", routingKey, message);

                    ProcessEvent(routingKey, message);

                    _channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ [KpiService - RabbitMQ] Error processing event: {Msg}", ex.Message);
                    try
                    {
                        _channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false);
                    }
                    catch { }
                }
            };

            _channel.BasicConsume(
                queue: KpiQueue,
                autoAck: false,
                consumer: consumer);

            _logger.LogInformation("✅ [KpiService - RabbitMQ Consumer] Listening on queue '{Queue}' bound to '{Exchange}'", KpiQueue, UserExchange);
            return true;
        }

        private void ProcessEvent(string routingKey, string jsonMessage)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetService<IRepository<AppUser>>();
            if (repo == null)
            {
                _logger.LogWarning("⚠️ [KpiService - RabbitMQ] IRepository<AppUser> not found in scope");
                return;
            }

            using var doc = JsonDocument.Parse(jsonMessage);
            var root = doc.RootElement;

            var userName = root.TryGetProperty("UserName", out var un) || root.TryGetProperty("userName", out un) 
                ? un.GetString() : null;
            if (string.IsNullOrWhiteSpace(userName)) return;

            var fullName = root.TryGetProperty("FullName", out var fn) || root.TryGetProperty("fullName", out fn) 
                ? fn.GetString() : userName;
            var email = root.TryGetProperty("Email", out var em) || root.TryGetProperty("email", out em) 
                ? em.GetString() : null;
            var phone = root.TryGetProperty("PhoneNumber", out var pn) || root.TryGetProperty("phoneNumber", out pn) 
                ? pn.GetString() : null;

            Guid userId = Guid.NewGuid();
            if (root.TryGetProperty("UserId", out var uid) || root.TryGetProperty("userId", out uid) || root.TryGetProperty("Id", out uid) || root.TryGetProperty("id", out uid))
            {
                if (uid.ValueKind == JsonValueKind.String && Guid.TryParse(uid.GetString(), out var parsedId))
                {
                    userId = parsedId;
                }
            }

            var existingUser = repo.GetQueryable().FirstOrDefault(u => u.UserName == userName || u.Id == userId);
            if (existingUser == null)
            {
                var newUser = new AppUser
                {
                    Id = userId,
                    UserName = userName,
                    Name = fullName,
                    Email = email,
                    PhoneNumber = phone,
                    Type = "User",
                    CreatedDate = DateTime.UtcNow,
                    IsDeleted = false
                };
                repo.Add(newUser);
                repo.SaveAsync().GetAwaiter().GetResult();
                _logger.LogInformation("🎉 [KpiService - RabbitMQ Sync] ✅ Synced NEW User @{UserName} (Id: {Id}) into Base_DB database!", userName, userId);
            }
            else
            {
                existingUser.Name = fullName ?? existingUser.Name;
                existingUser.Email = email ?? existingUser.Email;
                existingUser.PhoneNumber = phone ?? existingUser.PhoneNumber;
                existingUser.UpdatedDate = DateTime.UtcNow;
                repo.Update(existingUser);
                repo.SaveAsync().GetAwaiter().GetResult();
                _logger.LogInformation("🔄 [KpiService - RabbitMQ Sync] 🔄 Updated User @{UserName} in Base_DB database.", userName);
            }
        }

        private void Cleanup()
        {
            try
            {
                _channel?.Close();
                _channel?.Dispose();
                _connection?.Close();
                _connection?.Dispose();
            }
            catch { }
            _channel = null;
            _connection = null;
        }

        public override void Dispose()
        {
            Cleanup();
            base.Dispose();
        }
    }
}
