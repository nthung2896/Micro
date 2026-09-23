using Hinet.Service.RabbitMQ;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestRabbitMQController : ControllerBase
    {
        private readonly IRabbitMQService _rabbitMQService;

        public TestRabbitMQController(IRabbitMQService rabbitMQService)
        {
            _rabbitMQService = rabbitMQService;
        }

        [HttpPost("send")]
        public IActionResult SendMessage([FromBody] TestMessageRequest request)
        {
            
            if (string.IsNullOrEmpty(request.Message))
            {
                return BadRequest("Message cannot be empty");
            }

            var payload = new
            {
                Action = "TestConnection",
                Content = request.Message,
                Timestamp = DateTime.UtcNow
            };

            _rabbitMQService.SendMessage(payload, "audit_logs_queue");

            return Ok(new { success = true, message = "Đã gửi lên RabbitMQ thành công!" });
        }
    }

    public class TestMessageRequest
    {
        public string Message { get; set; }
    }
}
