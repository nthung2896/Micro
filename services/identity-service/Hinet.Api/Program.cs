using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SharedKernel.Security;
using Hinet.Model.Entities;
using Hinet.Repository;
using Hinet.Service.Common;
using Hinet.Service.DepartmentService;
using Hinet.Service.RabbitMQ;

var builder = WebApplication.CreateBuilder(args);

// 1. CORS cho các Client (Portal: 3000, Asset: 9797, KPI: 9696, Room: 4000)
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

// 2. DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=localhost;Database=Identity_DB;User Id=sa;Password=Hung@2025;MultipleActiveResultSets=true;Encrypt=False;TrustServerCertificate=True;";

builder.Services.AddDbContext<IdentityContext>(options =>
    options.UseSqlServer(connectionString));

// 3. ASP.NET Core Identity
builder.Services.AddIdentity<AppUser, AppRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<IdentityContext>()
.AddDefaultTokenProviders();

// 4. Shared JWT Auth
builder.Services.AddSharedJwtAuth(builder.Configuration);

// 5. Dependency Injection: Repository & Service 4 lớp
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped(typeof(IService<>), typeof(Service<>));
builder.Services.AddScoped<IDepartmentService, DepartmentService>();

// 6. RabbitMQ & Event Log Services
builder.Services.AddSingleton<IEventLogService, EventLogService>();
builder.Services.AddSingleton<IRabbitMQPublisher, RabbitMQPublisher>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString;
        options.JsonSerializerOptions.Converters.Add(new NullableGuidJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new GuidJsonConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Đảm bảo cấu trúc bảng AspNetUsers và các bảng liên quan luôn đầy đủ cột
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<IdentityContext>();
    try
    {
        dbContext.Database.EnsureCreated();
        var sqlEnsureColumns = @"
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'FullName')
                ALTER TABLE AspNetUsers ADD FullName NVARCHAR(250) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'IsActive')
                ALTER TABLE AspNetUsers ADD IsActive BIT NOT NULL CONSTRAINT DF_AspNetUsers_IsActive DEFAULT 1;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'Avatar')
                ALTER TABLE AspNetUsers ADD Avatar NVARCHAR(500) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'DepartmentId')
                ALTER TABLE AspNetUsers ADD DepartmentId UNIQUEIDENTIFIER NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'CreatedDate')
                ALTER TABLE AspNetUsers ADD CreatedDate DATETIME2 NOT NULL CONSTRAINT DF_AspNetUsers_CreatedDate DEFAULT GETUTCDATE();
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'CreatedBy')
                ALTER TABLE AspNetUsers ADD CreatedBy NVARCHAR(250) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'CreatedId')
                ALTER TABLE AspNetUsers ADD CreatedId UNIQUEIDENTIFIER NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'UpdatedDate')
                ALTER TABLE AspNetUsers ADD UpdatedDate DATETIME2 NOT NULL CONSTRAINT DF_AspNetUsers_UpdatedDate DEFAULT GETUTCDATE();
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'UpdatedBy')
                ALTER TABLE AspNetUsers ADD UpdatedBy NVARCHAR(250) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'UpdatedId')
                ALTER TABLE AspNetUsers ADD UpdatedId UNIQUEIDENTIFIER NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'IsDeleted')
                ALTER TABLE AspNetUsers ADD IsDeleted BIT NOT NULL CONSTRAINT DF_AspNetUsers_IsDeleted DEFAULT 0;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'DeleteDate')
                ALTER TABLE AspNetUsers ADD DeleteDate DATETIME2 NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'DeleteBy')
                ALTER TABLE AspNetUsers ADD DeleteBy NVARCHAR(250) NULL;
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AspNetUsers') AND name = 'DeleteId')
                ALTER TABLE AspNetUsers ADD DeleteId UNIQUEIDENTIFIER NULL;
        ";
        dbContext.Database.ExecuteSqlRaw(sqlEnsureColumns);
    }
    catch { }
}

app.Run("http://0.0.0.0:5001");

public class NullableGuidJsonConverter : System.Text.Json.Serialization.JsonConverter<Guid?>
{
    public override Guid? Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
    {
        if (reader.TokenType == System.Text.Json.JsonTokenType.Null)
            return null;

        if (reader.TokenType == System.Text.Json.JsonTokenType.String)
        {
            var str = reader.GetString();
            if (string.IsNullOrWhiteSpace(str))
                return null;
            if (Guid.TryParse(str, out var guid))
                return guid;
        }

        return null;
    }

    public override void Write(System.Text.Json.Utf8JsonWriter writer, Guid? value, System.Text.Json.JsonSerializerOptions options)
    {
        if (value.HasValue)
            writer.WriteStringValue(value.Value.ToString());
        else
            writer.WriteNullValue();
    }
}

public class GuidJsonConverter : System.Text.Json.Serialization.JsonConverter<Guid>
{
    public override Guid Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
    {
        if (reader.TokenType == System.Text.Json.JsonTokenType.String)
        {
            var str = reader.GetString();
            if (string.IsNullOrWhiteSpace(str))
                return Guid.Empty;
            if (Guid.TryParse(str, out var guid))
                return guid;
        }

        return Guid.Empty;
    }

    public override void Write(System.Text.Json.Utf8JsonWriter writer, Guid value, System.Text.Json.JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}
