using Hinet.Api.Dto;
using System.Net;

public class ExceptionHandlingMiddleware : IMiddleware
{
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception. Path={Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

        // Production: KHÔNG leak message exception ra client (có thể chứa SQL/path/stack).
        // Dev: trả message để debug.
        var message = _env.IsDevelopment()
            ? exception.Message
            : "Đã xảy ra lỗi. Vui lòng thử lại hoặc liên hệ quản trị viên.";

        var result = new DataResponse
        {
            Data = null,
            Status = false,
            Message = message,
        };

        return context.Response.WriteAsJsonAsync(result);
    }
}
