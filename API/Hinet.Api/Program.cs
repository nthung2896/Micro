using Hinet.Api;
using Hinet.Extensions;
using Hinet.Service.TaiLieuPreviewService;
using Serilog;
using System.Security.Authentication;

internal class Program
{
    private static void Main(string[] args)
    {
        // PostgreSQL: cho phép DateTime.Kind == Local/Unspecified với cột timestamp.
        // Tránh phải refactor toàn bộ DateTime.Now -> DateTime.UtcNow.
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        var builder = WebApplication.CreateBuilder(args);
        builder.WebHost.UseUrls("http://0.0.0.0:9966;http://0.0.0.0:5111");

        Log.Logger = new LoggerConfiguration()
            .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day)
            .Enrich.FromLogContext()
            .CreateLogger();
        builder.Host.UseSerilog();

        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.ConfigureHttpsDefaults(httpsOptions =>
            {
                httpsOptions.SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls13;
            });
        });

        builder.Configuration.UseAppSettings();

        builder.Services.AddHttpClient("FileServerClient", client =>
        {
            var baseUrl = builder.Configuration["FileServer:BaseUrl"];

            if (string.IsNullOrWhiteSpace(baseUrl))
                throw new InvalidOperationException("Missing config: FileServer:BaseUrl");

            if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var uri))
                throw new InvalidOperationException($"Invalid FileServer:BaseUrl = '{baseUrl}'");

            client.BaseAddress = uri;
        });

        builder.Services.AddMemoryCache();
        builder.Services.AddSingleton<Hinet.Service.RabbitMQ.IRabbitMQService, Hinet.Service.RabbitMQ.RabbitMQService>();
        builder.Services.UseConfigurationServices();
        builder.Services.Configure<LibreOfficePreviewOptions>(builder.Configuration.GetSection("LibreOffice"));
        builder.Services.AddSingleton(sp =>
        {
            var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<LibreOfficePreviewOptions>>().Value;
            return new PreviewConversionCoordinator(options.MaxConcurrentConversions);
        });
        builder.Services.AddTransient<ExceptionHandlingMiddleware>();

        // Rate limiting: chống brute-force endpoint đăng nhập (5 req / 1 phút / IP)
        builder.Services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy("login", httpContext =>
                System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anon",
                factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0,
            }));
        });

        var app = builder.Build();

        // Swagger chỉ bật ở môi trường dev (production không expose API docs)
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "Admin Base API");
        });
        app.UseDeveloperExceptionPage();

        app.UseSerilogRequestLogging();

        // Security headers chuẩn cho mọi response.
        app.Use(async (ctx, next) =>
        {
            var headers = ctx.Response.Headers;
            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "DENY";
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            headers["X-XSS-Protection"] = "0"; // tắt legacy filter, dựa vào CSP
            // Strict-Transport-Security chỉ khi chạy HTTPS production:
            // headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
            await next();
        });

        app.UseRouting();

        app.UseCors(c =>
        {
            c.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>())
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });

        app.UseStaticFiles();

        app.UseAuthentication();
        app.UseAuthorization();
        app.UseRateLimiter();

        app.UseMiddleware<ExceptionHandlingMiddleware>();

        app.MapControllers();


        app.Run();
    }
}
