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

        public EventsController(IEventLogService eventLogService, IRabbitMQPublisher rabbitMQPublisher)
        {
            _eventLogService = eventLogService;
            _rabbitMQPublisher = rabbitMQPublisher;
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
        /// Bắn sự kiện thử nghiệm để kiểm tra kết nối RabbitMQ và các consumers
        /// </summary>
        [HttpPost("publish-test")]
        public IActionResult PublishTestEvent([FromBody] TestEventRequest? request)
        {
            var userName = request?.UserName ?? $"test_user_{DateTime.UtcNow.Ticks % 10000}";
            var testEvent = new UserCreatedEvent
            {
                UserId = Guid.NewGuid(),
                UserName = userName,
                FullName = request?.FullName ?? $"Người dùng Thử Nghiệm ({userName})",
                Email = $"{userName}@ebizoffice.vn",
                PhoneNumber = "0987654321",
                Roles = request?.Roles ?? new List<string> { "USER", "ROLE_TAISAN", "ROLE_KPI" },
                CreatedAt = DateTime.UtcNow,
                SourceService = "identity-service [Manual Test]"
            };

            _rabbitMQPublisher.PublishUserCreated(testEvent);

            return Ok(ApiResponse<UserCreatedEvent>.Ok(testEvent, $"Đã bắn sự kiện UserCreatedEvent cho @{userName} vào RabbitMQ"));
        }
    }

    public class TestEventRequest
    {
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public List<string>? Roles { get; set; }
    }
}
