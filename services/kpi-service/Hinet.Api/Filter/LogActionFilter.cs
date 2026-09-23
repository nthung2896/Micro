using Hinet.Model;
using Hinet.Model.Entities;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;

namespace Hinet.Api.Filter
{
    public class LogActionFilter : ActionFilterAttribute
    {
        private const string AuditItemKey = "AuditLog_Item";
        private readonly ILogger<LogActionFilter> _logger;
        private readonly Hinet.Service.RabbitMQ.IRabbitMQService _rabbitMQService;

        public LogActionFilter(ILogger<LogActionFilter> logger, Hinet.Service.RabbitMQ.IRabbitMQService rabbitMQService)
        {
            _logger = logger;
            _rabbitMQService = rabbitMQService;
        }

        // Ghi log trước khi action thực thi (Đã tắt theo yêu cầu)
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            /*
            var httpContext = context.HttpContext;
            var request = httpContext.Request;

            if (request != null)
            {
                var audit = new Audit
                {
                    AuditID = Guid.NewGuid(),
                    TimeAccessed = DateTime.Now,
                    IPAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? "",
                    URLAccessed = request.Path.Value ?? "",
                    Data = SerializeRequestData(request)
                };

                var user = httpContext.User;
                if (user != null)
                {
                    audit.UserName = user.Identity?.Name ?? user.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "Ẩn danh";
                    
                    var userIdClaim = user.FindFirst("UserId")?.Value 
                                      ?? user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                    if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedGuid))
                    {
                        audit.UserId = parsedGuid;
                    }
                }
                else
                {
                    audit.UserName = "Ẩn danh";
                }

                try
                {
                    audit.SessionID = httpContext.Session?.Id ?? "";
                }
                catch
                {
                    audit.SessionID = "";
                }

                audit.Note = "";

                // Dùng HttpContext.Items thay vì biến field private để đảm bảo Thread-Safe (tránh đè log giữa các request)
                httpContext.Items[AuditItemKey] = audit;
            }
            */

            base.OnActionExecuting(context);
        }

        // Ghi log sau khi action thực thi (Đã tắt theo yêu cầu)
        public override void OnActionExecuted(ActionExecutedContext context)
        {
            /*
            try
            {
                if (context.HttpContext.Items.TryGetValue(AuditItemKey, out var item) && item is Audit audit)
                {
                    var statusCode = context.HttpContext.Response.StatusCode;
                    var controllerName = context.Controller.GetType().Name.Replace("Controller", "");
                    var actionName = context.ActionDescriptor.RouteValues.TryGetValue("action", out var act) ? act : context.ActionDescriptor.DisplayName;

                    audit.Note = $"{context.HttpContext.Request.Method} {controllerName}/{actionName} [Status: {statusCode}]";

                    // Gửi bất đồng bộ sang ThreadPool background -> Giúp HTTP Response nhả ngay lập tức cho client
                    Task.Run(() =>
                    {
                        try
                        {
                            _rabbitMQService.SendMessage(audit, "audit_logs_queue");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Lỗi khi gửi Audit Log qua RabbitMQ trong Task.Run");
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xử lý OnActionExecuted Audit Log");
            }
            */

            base.OnActionExecuted(context);
        }

        private string SerializeRequestData(HttpRequest request)
        {
            try
            {
                string bodyContent = string.Empty;

                // Kiểm tra nếu request là JSON/Text và Body hỗ trợ Seek (Buffering)
                if (request.Body != null && request.Body.CanSeek)
                {
                    request.Body.Position = 0; // Đặt con trỏ về đầu
                    using (var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true))
                    {
                        bodyContent = reader.ReadToEnd();
                    }
                    request.Body.Position = 0; // Đặt con trỏ lại về đầu để Controller tiếp tục đọc
                }

                var requestInfo = new
                {
                    Method = request.Method,
                    Url = $"{request.Scheme}://{request.Host}{request.Path}{request.QueryString}",
                    Headers = request.Headers.ToDictionary(h => h.Key, h => h.Value.ToString()),
                    QueryString = request.QueryString.HasValue ? request.QueryString.Value : null,
                    Body = string.IsNullOrWhiteSpace(bodyContent) ? null : bodyContent
                };

                return JsonSerializer.Serialize(requestInfo);
            }
            catch
            {
                return "";
            }
        }
    }
}
