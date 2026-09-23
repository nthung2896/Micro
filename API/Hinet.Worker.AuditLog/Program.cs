using Hinet.Model;
using Hinet.Worker.AuditLog;
using Microsoft.EntityFrameworkCore;

// Cấu hình Npgsql cho DateTime
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = Host.CreateApplicationBuilder(args);

// 1. Cấu hình HttpContextAccessor và DbContext (PostgreSQL)
builder.Services.AddHttpContextAccessor();
builder.Services.AddDbContext<HinetContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                           ?? builder.Configuration["Connections:DefaultConnection"];
    options.UseSqlServer(connectionString, b => b.MigrationsAssembly("Hinet.Model"));
});

// 2. Đăng ký HostedService Worker
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
