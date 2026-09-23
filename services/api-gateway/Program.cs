var builder = WebApplication.CreateBuilder(args);

// Add CORS để hỗ trợ mọi client trong thư mục clients/
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllClients", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Thêm YARP Reverse Proxy
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAllClients");

// Endpoint kiểm tra trạng thái Gateway
app.MapGet("/", () => Results.Ok(new
{
    service = "API Gateway (YARP)",
    status = "Running",
    timestamp = DateTime.UtcNow,
    endpoints = new[] { "/api/auth/*", "/api/rooms/*", "/api/kpi/*", "/api/files/*" }
}));

app.MapReverseProxy();

app.Run("http://0.0.0.0:5000");
