using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Models;
using SharedKernel.Events;
using Hinet.Repository;
using Hinet.Service.RabbitMQ;

namespace Hinet.Api.Controllers
{
    [ApiController]
    [Route("api/events")]
    [Route("api/auth/events")]
    public class EventsController : ControllerBase
    {
        private readonly IEventLogService _eventLogService;
        private readonly IRabbitMQPublisher _publisher;
        private readonly IdentityContext _dbContext;

        public EventsController(
            IEventLogService eventLogService,
            IRabbitMQPublisher publisher,
            IdentityContext dbContext)
        {
            _eventLogService = eventLogService;
            _publisher = publisher;
            _dbContext = dbContext;
        }

        [HttpGet("logs")]
        public IActionResult GetLogs([FromQuery] int count = 50)
        {
            var logs = _eventLogService.GetRecentLogs(count);
            return Ok(ApiResponse<List<EventLogItem>>.Ok(logs, "Lấy lịch sử sự kiện RabbitMQ thành công"));
        }

        [HttpPost("clear-logs")]
        public IActionResult ClearLogs()
        {
            _eventLogService.ClearLogs();
            return Ok(ApiResponse<string>.Ok("Đã làm trống lịch sử sự kiện"));
        }

        [HttpPost("sync-all-users")]
        public async Task<IActionResult> SyncAllUsers()
        {
            var users = await _dbContext.Users.Where(u => !u.IsDeleted).ToListAsync();
            var userRoles = await (from ur in _dbContext.UserRole
                                   join r in _dbContext.Role on ur.RoleId equals r.Id
                                   where !r.IsDeleted && !ur.IsDeleted
                                   select new { ur.UserId, RoleCode = r.Code }).ToListAsync();

            int count = 0;
            foreach (var u in users)
            {
                var roles = userRoles.Where(r => r.UserId == u.Id).Select(r => r.RoleCode).ToList();
                if (roles.Count == 0 && u.UserName == "admin") roles = new List<string> { "ADMIN", "ROLE_TAISAN", "ROLE_KPI", "ROLE_ROOM" };

                _publisher.PublishUserCreated(new UserCreatedEvent
                {
                    UserId = u.Id,
                    UserName = u.UserName ?? string.Empty,
                    FullName = u.FullName ?? u.UserName ?? string.Empty,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    Roles = roles,
                    CreatedAt = DateTime.UtcNow,
                    SourceService = "identity-service [Sync All]"
                });
                count++;
            }

            return Ok(ApiResponse<object>.Ok(new { syncedCount = count }, $"Đã phát {count} sự kiện UserCreated vào RabbitMQ"));
        }
    }
}
