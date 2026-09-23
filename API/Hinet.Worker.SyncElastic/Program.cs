using Hinet.Model;
using Hinet.Worker.SyncElastic;
using Microsoft.EntityFrameworkCore;
using Elastic.Clients.Elasticsearch;
using Elastic.Transport;
using Hinet.Repository;
using Hinet.Service.Common.Service;
using Hinet.Service.Core.Mapper;
using Microsoft.Extensions.DependencyInjection;

// Cấu hình Npgsql cho DateTime
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = Host.CreateApplicationBuilder(args);

// 1. Cấu hình HttpContextAccessor và DbContext (PostgreSQL)
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<DbContext, HinetContext>();
builder.Services.AddDbContext<HinetContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                           ?? builder.Configuration["Connections:DefaultConnection"];
    options.UseSqlServer(connectionString, b => b.MigrationsAssembly("Hinet.Model"));
});

// 2. Cấu hình ElasticsearchClient
builder.Services.AddSingleton<ElasticsearchClient>(sp =>
{
    var url = builder.Configuration["Elasticsearch:Url"];
    if (string.IsNullOrEmpty(url)) return new ElasticsearchClient();

    var settings = new ElasticsearchClientSettings(new Uri(url));
    
    var username = builder.Configuration["Elasticsearch:Username"];
    var password = builder.Configuration["Elasticsearch:Password"];
    if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
    {
        settings.Authentication(new BasicAuthentication(username, password));
    }
    
    // Bypass SSL validation trong dev
    settings.ServerCertificateValidationCallback(CertificateValidations.AllowAll);

    return new ElasticsearchClient(settings);
});

// 3. Đăng ký AutoMapper, Repositories và Services
builder.Services.AddScoped<IMapper, Mapper>();

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
var repositoryTypes = typeof(IRepository<>).Assembly.GetTypes()
     .Where(x => !string.IsNullOrEmpty(x.Namespace) && x.Namespace.StartsWith("Hinet.Repository") && x.Name.EndsWith("Repository"));
foreach (var intf in repositoryTypes.Where(t => t.IsInterface))
{
    var impl = repositoryTypes.FirstOrDefault(c => c.IsClass && intf.Name.Substring(1) == c.Name);
    if (impl != null) builder.Services.AddScoped(intf, impl);
}

builder.Services.AddScoped(typeof(IService<>), typeof(Service<>));
var serviceTypes = typeof(IService<>).Assembly.GetTypes()
     .Where(x => !string.IsNullOrEmpty(x.Namespace) && x.Namespace.StartsWith("Hinet.Service") && x.Name.EndsWith("Service"));
foreach (var intf in serviceTypes.Where(t => t.IsInterface && t.Name != "IJobQueueService"))
{
    var impl = serviceTypes.FirstOrDefault(c => c.IsClass && intf.Name.Substring(1) == c.Name);
    if (impl != null) builder.Services.AddScoped(intf, impl);
}

// 4. Đăng ký HostedService Worker
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
