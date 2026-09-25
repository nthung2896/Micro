using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using SharedKernel.Events;
using SharedKernel.Models;
using IdentityService.Services;

namespace IdentityService.Controllers
{
    [ApiController]
    [Route("api/auth/events")]
    [Route("api/events")]
    public class EventsController : ControllerBase
    {
        private readonly IEventLogService _eventLogService;
        private readonly IRabbitMQPublisher _rabbitMQPublisher;
        private readonly IdentityService.Data.IdentityContext _dbContext;

        public EventsController(
            IEventLogService eventLogService, 
            IRabbitMQPublisher rabbitMQPublisher,
            IdentityService.Data.IdentityContext dbContext)
        {
            _eventLogService = eventLogService;
            _rabbitMQPublisher = rabbitMQPublisher;
            _dbContext = dbContext;
        }

        /// <summary>
        /// Lấy lịch sử các sự kiện Message Queue đã bắn ra
        /// </summary>
        [HttpGet("history")]
        public IActionResult GetEventHistory([FromQuery] int count = 50)
        {
            var logs = _eventLogService.GetRecentEvents(count);
            return Ok(ApiResponse<List<EventLogItem>>.Ok(logs, "Lấy lịch sử sự kiện thành công"));
        }

        /// <summary>
        /// Bắn sự kiện thử nghiệm: Lưu vào Identity_DB và bắn UserCreatedEvent vào RabbitMQ
        /// </summary>
        [HttpPost("publish-test")]
        public async System.Threading.Tasks.Task<IActionResult> PublishTestEvent([FromBody] TestEventRequest? request)
        {
            var userName = request?.UserName ?? $"demo_user_{DateTime.UtcNow.Ticks % 10000}";
            var fullName = request?.FullName ?? $"Người dùng Thử Nghiệm ({userName})";
            var email = $"{userName}@ebizoffice.vn";
            var phone = "0987654321";

            var user = new IdentityService.Entities.AppUser
            {
                Id = Guid.NewGuid(),
                UserName = userName,
                NormalizedUserName = userName.ToUpper(),
                FullName = fullName,
                Email = email,
                NormalizedEmail = email.ToUpper(),
                PhoneNumber = phone,
                IsActive = true,
                CreatedDate = DateTime.UtcNow
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var testEvent = new UserCreatedEvent
            {
                UserId = user.Id,
                UserName = user.UserName,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Roles = request?.Roles ?? new List<string> { "USER", "ROLE_TAISAN", "ROLE_KPI" },
                CreatedAt = user.CreatedDate,
                SourceService = "identity-service [Manual Test]"
            };

            _rabbitMQPublisher.PublishUserCreated(testEvent);

            return Ok(ApiResponse<UserCreatedEvent>.Ok(testEvent, $"Đã lưu vào Identity_DB và bắn sự kiện UserCreatedEvent cho @{userName} vào RabbitMQ"));
        }

        /// <summary>
        /// Đồng bộ toàn bộ tài khoản hiện có trong Identity_DB sang RabbitMQ (để cập nhật Base_TaiSan & Base_DB)
        /// </summary>
        [HttpPost("sync-all")]
        public async System.Threading.Tasks.Task<IActionResult> SyncAllUsersToRabbitMQ()
        {
            var users = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(_dbContext.Users);
            int count = 0;

            foreach (var u in users)
            {
                var evt = new UserCreatedEvent
                {
                    UserId = u.Id,
                    UserName = u.UserName ?? string.Empty,
                    FullName = u.FullName ?? u.UserName ?? string.Empty,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    Roles = new List<string> { "USER", "ROLE_TAISAN", "ROLE_KPI" },
                    CreatedAt = u.CreatedDate,
                    SourceService = "identity-service [Sync All]"
                };

                _rabbitMQPublisher.PublishUserCreated(evt);
                count++;
            }

            return Ok(ApiResponse<object>.Ok(new { syncedCount = count }, $"Đã đồng bộ {count} tài khoản từ Identity_DB vào RabbitMQ!"));
        }
    }

    public class TestEventRequest
    {
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public List<string>? Roles { get; set; }
    }
}
