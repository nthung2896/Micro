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

            // 3. Bind Queue to Exchange with routing keys 'user.#' and 'department.#'
            _channel.QueueBind(
                queue: KpiQueue,
                exchange: UserExchange,
                routingKey: "user.#",
                arguments: null);

            _channel.QueueBind(
                queue: KpiQueue,
                exchange: UserExchange,
                routingKey: "department.#",
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

            using var doc = JsonDocument.Parse(jsonMessage);
            var root = doc.RootElement;

            if (routingKey.StartsWith("department."))
            {
                ProcessDepartmentEvent(routingKey, root, scope);
                return;
            }

            var userRepo = scope.ServiceProvider.GetService<IRepository<AppUser>>();
            var roleRepo = scope.ServiceProvider.GetService<IRepository<Role>>();
            var userRoleRepo = scope.ServiceProvider.GetService<IRepository<UserRole>>();

            if (userRepo == null)
            {
                _logger.LogWarning("⚠️ [KpiService - RabbitMQ] IRepository<AppUser> not found in scope");
                return;
            }

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

            var existingUser = userRepo.GetQueryable().FirstOrDefault(u => u.UserName == userName || u.Id == userId);
            if (existingUser == null)
            {
                existingUser = new AppUser
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
                userRepo.Add(existingUser);
                userRepo.SaveAsync().GetAwaiter().GetResult();
                _logger.LogInformation("🎉 [KpiService - RabbitMQ Sync] ✅ Synced NEW User @{UserName} (Id: {Id}) into Base_DB database!", userName, userId);
            }
            else
            {
                existingUser.Name = fullName ?? existingUser.Name;
                existingUser.Email = email ?? existingUser.Email;
                existingUser.PhoneNumber = phone ?? existingUser.PhoneNumber;
                existingUser.UpdatedDate = DateTime.UtcNow;
                userRepo.Update(existingUser);
                userRepo.SaveAsync().GetAwaiter().GetResult();
                _logger.LogInformation("🔄 [KpiService - RabbitMQ Sync] 🔄 Updated User @{UserName} in Base_DB database.", userName);
            }

            // Sync User Roles mapping
            if (roleRepo != null && userRoleRepo != null)
            {
                List<string> roleCodes = new();
                if (root.TryGetProperty("Roles", out var rolesProp) || root.TryGetProperty("roles", out rolesProp))
                {
                    if (rolesProp.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var r in rolesProp.EnumerateArray())
                        {
                            var rStr = r.GetString();
                            if (!string.IsNullOrWhiteSpace(rStr)) roleCodes.Add(rStr);
                        }
                    }
                }

                if (roleCodes.Count > 0)
                {
                    foreach (var code in roleCodes)
                    {
                        var role = roleRepo.GetQueryable().FirstOrDefault(r => r.Code == code && !r.IsDeleted);
                        if (role == null)
                        {
                            role = new Role
                            {
                                Id = Guid.NewGuid(),
                                Code = code,
                                Name = code,
                                Type = "KPI",
                                IsActive = true,
                                CreatedDate = DateTime.UtcNow,
                                IsDeleted = false
                            };
                            roleRepo.Add(role);
                            roleRepo.SaveAsync().GetAwaiter().GetResult();
                        }

                        var hasUserRole = userRoleRepo.GetQueryable().Any(ur => ur.UserId == existingUser.Id && ur.RoleId == role.Id && !ur.IsDeleted);
                        if (!hasUserRole)
                        {
                            userRoleRepo.Add(new UserRole
                            {
                                Id = Guid.NewGuid(),
                                UserId = existingUser.Id,
                                RoleId = role.Id,
                                CreatedDate = DateTime.UtcNow,
                                IsDeleted = false
                            });
                            userRoleRepo.SaveAsync().GetAwaiter().GetResult();
                            _logger.LogInformation("🔑 [KpiService - RabbitMQ Sync] Mapped User @{UserName} to Role {RoleCode} in Base_DB", userName, code);
                        }
                    }
                }
            }
        }

        private void ProcessDepartmentEvent(string routingKey, JsonElement root, IServiceScope scope)
        {
            var deptRepo = scope.ServiceProvider.GetService<IRepository<Department>>();
            if (deptRepo == null)
            {
                _logger.LogWarning("⚠️ [KpiService - RabbitMQ] IRepository<Department> not found in scope");
                return;
            }

            if (!root.TryGetProperty("Id", out var idProp) && !root.TryGetProperty("id", out idProp)) return;
            if (!Guid.TryParse(idProp.GetString(), out var deptId)) return;

            var code = root.TryGetProperty("Code", out var cp) || root.TryGetProperty("code", out cp) ? cp.GetString() : "";
            var name = root.TryGetProperty("Name", out var np) || root.TryGetProperty("name", out np) ? np.GetString() : "";
            var shortName = root.TryGetProperty("ShortName", out var snp) || root.TryGetProperty("shortName", out snp) ? snp.GetString() : null;
            
            Guid? parentId = null;
            if ((root.TryGetProperty("ParentId", out var pip) || root.TryGetProperty("parentId", out pip)) && pip.ValueKind == JsonValueKind.String && Guid.TryParse(pip.GetString(), out var pid))
            {
                parentId = pid;
            }

            int level = root.TryGetProperty("Level", out var lp) || root.TryGetProperty("level", out lp) ? lp.GetInt32() : 1;
            string loai = root.TryGetProperty("Loai", out var lop) || root.TryGetProperty("loai", out lop) ? lop.GetString() ?? "PHONG_BAN" : "PHONG_BAN";
            long priority = root.TryGetProperty("Priority", out var prp) || root.TryGetProperty("priority", out prp) ? prp.GetInt64() : 1;
            bool isActive = (!root.TryGetProperty("IsActive", out var iap) && !root.TryGetProperty("isActive", out iap)) || iap.GetBoolean();
            string? address = root.TryGetProperty("Address", out var adp) || root.TryGetProperty("address", out adp) ? adp.GetString() : null;
            string? hotline = root.TryGetProperty("Hotline", out var hlp) || root.TryGetProperty("hotline", out hlp) ? hlp.GetString() : null;
            string? email = root.TryGetProperty("Email", out var emp) || root.TryGetProperty("email", out emp) ? emp.GetString() : null;

            if (routingKey.EndsWith("deleted"))
            {
                var existing = deptRepo.GetQueryable().FirstOrDefault(d => d.Id == deptId || d.Code == code);
                if (existing != null)
                {
                    existing.IsDeleted = true;
                    existing.UpdatedDate = DateTime.UtcNow;
                    deptRepo.Update(existing);
                    deptRepo.SaveAsync().GetAwaiter().GetResult();
                    _logger.LogInformation("🗑️ [KpiService - RabbitMQ Sync] Soft-deleted Department '{Code}' in Base_DB", code);
                }
                return;
            }

            var dept = deptRepo.GetQueryable().FirstOrDefault(d => d.Id == deptId || d.Code == code);
            if (dept == null)
            {
                dept = new Department
                {
                    Id = deptId,
                    Code = code ?? string.Empty,
                    Name = name ?? string.Empty,
                    ShortName = shortName,
                    ParentId = parentId,
                    Level = level,
                    Loai = loai,
                    Priority = priority,
                    IsActive = isActive,
                    Address = address,
                    Hotline = hotline,
                    Email = email,
                    CreatedDate = DateTime.UtcNow,
                    IsDeleted = false
                };
                deptRepo.Add(dept);
                _logger.LogInformation("🏢 [KpiService - RabbitMQ Sync] ✅ Synced NEW Department '{Name}' ({Code}) into Base_DB!", name, code);
            }
            else
            {
                dept.Name = name ?? dept.Name;
                dept.ShortName = shortName ?? dept.ShortName;
                dept.ParentId = parentId;
                dept.Level = level;
                dept.Loai = loai;
                dept.Priority = priority;
                dept.IsActive = isActive;
                dept.Address = address ?? dept.Address;
                dept.Hotline = hotline ?? dept.Hotline;
                dept.Email = email ?? dept.Email;
                dept.IsDeleted = false;
                dept.UpdatedDate = DateTime.UtcNow;
                deptRepo.Update(dept);
                _logger.LogInformation("🏢 [KpiService - RabbitMQ Sync] 🔄 Updated Department '{Name}' ({Code}) in Base_DB", name, code);
            }
            deptRepo.SaveAsync().GetAwaiter().GetResult();
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
