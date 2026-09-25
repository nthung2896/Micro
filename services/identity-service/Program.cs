using Microsoft.EntityFrameworkCore;
using IdentityService.Data;
using IdentityService.Entities;
using SharedKernel.Security;

var builder = WebApplication.CreateBuilder(args);

// Database Context riêng biệt
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<IdentityContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddIdentityCore<AppUser>()
    .AddRoles<AppRole>()
    .AddEntityFrameworkStores<IdentityContext>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Thêm cấu hình JWT
builder.Services.AddSharedJwtAuth(builder.Configuration);

// Message Queue Event-Driven Services
builder.Services.AddSingleton<IdentityService.Services.IEventLogService, IdentityService.Services.EventLogService>();
builder.Services.AddSingleton<IdentityService.Services.IRabbitMQPublisher, IdentityService.Services.RabbitMQPublisher>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run("http://localhost:5001");
