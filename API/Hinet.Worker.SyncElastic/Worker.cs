using CommonHelper.String;
using Elastic.Clients.Elasticsearch;
using Hinet.Model;
using Hinet.Model.Entities;
using Hinet.Repository;
using Hinet.Repository.KPI_NhomTieuChiRepository;
using Hinet.Service.KPI_NhomTieuChiService;
using Hinet.Service.KPI_NhomTieuChiService.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Hinet.Worker.SyncElastic
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;
        private IConnection? _connection;
        private IModel? _channel;
        private readonly string _queueName;

        public Worker(ILogger<Worker> logger, IConfiguration configuration, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _configuration = configuration;
            _serviceProvider = serviceProvider;
            _queueName = _configuration["RabbitMQ:QueueName"]
                ?? throw new InvalidOperationException("Thiếu cấu hình RabbitMQ:QueueName.");
            InitRabbitMQ();
        }

        /// <summary>
        /// Bước 1: Khởi tạo kết nối tới server RabbitMQ và khai báo hàng đợi (Queue)
        /// </summary>
        private void InitRabbitMQ()
        {
            try
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
                    ClientProvidedName = $"WorkerSyncElastic-[{Environment.GetEnvironmentVariable("CONTAINER_TYPE") ?? "Docker/K8s"}]-{Environment.MachineName}"
                };

                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();

                // Khai báo Queue lắng nghe (durable = true để message không bị mất khi RabbitMQ restart)
                _channel.QueueDeclare(
                    queue: _queueName,
                    durable: true,
                    exclusive: false,
                    autoDelete: false,
                    arguments: null);
                
                _logger.LogInformation("[SyncElasticWorker] Khởi tạo kết nối RabbitMQ thành công, lắng nghe trên queue '{queue}'", _queueName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[SyncElasticWorker] Lỗi khi kết nối RabbitMQ");
            }
        }

        /// <summary>
        /// Bước 2: Kích hoạt lắng nghe (Pull message) liên tục từ RabbitMQ Queue và xử lý bất đồng bộ
        /// </summary>
        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            stoppingToken.ThrowIfCancellationRequested();

            if (_channel == null) return Task.CompletedTask;

            var consumer = new EventingBasicConsumer(_channel);

            // Đăng ký Event xử lý khi có message mới được đẩy vào Queue
            consumer.Received += async (ch, ea) =>
            {
                var content = Encoding.UTF8.GetString(ea.Body.ToArray());
                _logger.LogInformation("[SyncElasticWorker] Nhận yêu cầu đồng bộ từ queue '{queueName}': {content}", _queueName, content);
                try
                {
                    // Thực thi việc sync dữ liệu lên Elasticsearch
                    await ProcessSyncAllAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[SyncElasticWorker] Lỗi khi thực thi đồng bộ Elastic");
                }
                finally
                {
                    // Báo cho RabbitMQ biết là đã xử lý xong (Ack) để xóa message khỏi queue
                    _channel.BasicAck(ea.DeliveryTag, false);
                }
            };

            // Thực sự bắt đầu LẮNG NGHE / PULL MESSAGE từ Queue
            _channel.BasicConsume(_queueName, false, consumer);

            return Task.CompletedTask;
        }

        /// <summary>
        /// Bước 3: Tạo scope dịch vụ và gọi Service để lấy dữ liệu DB và index vào Elasticsearch
        /// </summary>
        private async Task ProcessSyncAllAsync()
        {
            using var scope = _serviceProvider.CreateScope();

            var kPI_NhomTieuChiService = scope.ServiceProvider.GetRequiredService<IKPI_NhomTieuChiService>();

            _logger.LogInformation("[SyncElasticWorker] Đang gọi IKPI_NhomTieuChiService.SyncToElastic() để đồng bộ toàn bộ dữ liệu...");

            var success = await kPI_NhomTieuChiService.SyncToElastic();
            if (success)
            {
                _logger.LogInformation("[SyncElasticWorker] 🎉 HOÀN THÀNH ĐỒNG BỘ TOÀN BỘ BẢN GHI LÊN ELASTICSEARCH QUA SERVICE!");
            }
            else
            {
                _logger.LogError("[SyncElasticWorker] ĐỒNG BỘ ELASTICSEARCH QUA SERVICE THẤT BẠI.");
            }
        }

        /// <summary>
        /// Đóng kết nối RabbitMQ khi Worker bị ngắt
        /// </summary>
        public override void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
            base.Dispose();
        }
    }
}
