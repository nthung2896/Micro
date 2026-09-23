using Hinet.FileServer.Configuration;
using Hinet.FileServer.Helper.Mapper;
using Hinet.FileServer.Middleware;
using Hinet.FileServer.Model;
using Hinet.FileServer.Services.TaiLieuDinhKemService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Security.Authentication;
using System.Text;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.Configure<FileServerSettings>(
    builder.Configuration.GetSection("FileServer"));

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ConfigureHttpsDefaults(httpsOptions =>
    {
        httpsOptions.SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls13;
    });
});


builder.Services.AddDbContext<HinetContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ITaiLieuDinhKemService, TaiLieuDinhKemService>();
builder.Services.AddScoped<IMapper, Mapper>();

builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    RequireExpirationTime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration.GetSection("AuthSetting").GetValue<string>("Key"))),
                    ValidateIssuerSigningKey = true,
                };
            });



var app = builder.Build();


app.UseSwagger();
app.UseSwaggerUI();


app.UseCors(c =>
{
    c.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>())
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
});

app.UseMiddleware<FileServerMiddleware>();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
           Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads")),
    RequestPath = "/uploads",
});


app.UseAuthorization();


app.UseHttpsRedirection();

app.MapControllers();

app.Run();
