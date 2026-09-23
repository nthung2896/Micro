using Hinet.Api.Filter;
using Hinet.Api.BackgroundServices;
using Hinet.Extensions;
using Hinet.Model;
using Hinet.Model.Entities;
using Hinet.Repository;
using Hinet.Repository.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using System.Text;
namespace Hinet.Api
{
    public static class Startup
    {

        public static void UseConfigurationServices(this IServiceCollection services)
        {
            services.AddControllers(options =>
            {
                options.Filters.Add<LogActionFilter>();
            });
            services.AddHttpClient();
            services.AddHttpClient("MOITSigner", client =>
            {
                client.BaseAddress = new Uri("http://localhost:14005");
            });
            services.AddScoped<MOITSignerService>();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            services.AddSwaggerGen(opts =>
            {
                opts.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

                opts.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT"
                });

                opts.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "bearer",
                            Name = "Authorization",
                            In = ParameterLocation.Header
                        },
                        Array.Empty<string>()
                    }
                });

                opts.CustomSchemaIds(type =>
                {
                    if (type.IsGenericType)
                    {
                        var genericTypeName = type.GetGenericTypeDefinition().Name;
                        genericTypeName = genericTypeName.Split('`')[0];

                        var genericArgs = type.GetGenericArguments()
                            .Select(t => GenerateSchemaId(t));

                        var joined = string.Join("", genericArgs);

                        return $"{joined}{genericTypeName}";
                    }

                    var name = type.Name.Replace("+", ".");

                    return $"{type.Namespace}_{name}";
                });

                static string GenerateSchemaId(Type type)
                {
                    if (type.IsGenericType)
                    {
                        var genericTypeName = type.GetGenericTypeDefinition().Name.Split('`')[0];
                        var genericArgs = type.GetGenericArguments()
                            .Select(GenerateSchemaId);

                        return $"{string.Join("", genericArgs)}{genericTypeName}";
                    }

                    return $"{type.Namespace}_{type.Name}";
                }
            });


            //services.AddSignalR();
            services.Configure<FormOptions>(options => { options.MultipartBodyLengthLimit = 1048576000; });

            services.AddDbContext<HinetContext>(options =>
            {
                var connectionString = AppSettings.Connections.DefaultConnection;
                options.UseSqlServer(connectionString, b => b.MigrationsAssembly("Hinet.Model"));
            });

            //services.AddHangfire(configuration => configuration
            //    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            //    .UseSimpleAssemblyNameTypeSerializer()
            //    .UseRecommendedSerializerSettings()
            //    .UseSqlServerStorage(AppSettings.Connections.HangfireConnection ?? AppSettings.Connections.DefaultConnection, new SqlServerStorageOptions
            //    {
            //        CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
            //        SlidingInvisibilityTimeout = TimeSpan.FromMinutes(5),
            //        QueuePollInterval = TimeSpan.Zero,
            //        UseRecommendedIsolationLevel = true,
            //        DisableGlobalLocks = true
            //    }));

            //services.AddHangfireServer();


            // Đăng ký Conventions (chuyển camelCase)
            var pack = new ConventionPack
            {
                new CamelCaseElementNameConvention(),
                new IgnoreIfNullConvention(true)
            };
            ConventionRegistry.Register("HinetProjectConventions", pack, t => true);

            // Ánh xạ Guid cho AuditEntity
            if (!BsonClassMap.IsClassMapRegistered(typeof(AuditableEntity)))
            {
                BsonClassMap.RegisterClassMap<AuditableEntity>(cm =>
                {
                    cm.AutoMap();
                    var standardGuidSerializer = new GuidSerializer(GuidRepresentation.Standard);

                    cm.MapProperty(c => c.CreatedId).SetSerializer(new NullableSerializer<Guid>(standardGuidSerializer));
                    cm.MapProperty(c => c.UpdatedId).SetSerializer(new NullableSerializer<Guid>(standardGuidSerializer));
                    cm.MapProperty(c => c.DeletedId).SetSerializer(new NullableSerializer<Guid>(standardGuidSerializer));
                });
            }

            // Cấu hình Guid mặc định cho MongoDB
            try
            {
                BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
            }
            catch
            {
                // Đã được đăng ký trước đó
            }
            services.AddSingleton<IMongoClient, MongoClient>(sp =>
            {
                var connectionString = AppSettings.Connections.MongoDBConnection.ConnectionString;
                var settings = MongoClientSettings.FromConnectionString(connectionString);

                return new MongoClient(settings);
            });
            services.AddScoped(sp =>
            {
                var client = sp.GetRequiredService<IMongoClient>();
                var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();
                return new HinetMongoContext(client, AppSettings.Connections.MongoDBConnection.DatabaseName, httpContextAccessor);
            });
            
            services.AddSingleton<Elastic.Clients.Elasticsearch.ElasticsearchClient>(sp =>
            {
                var url = AppSettings.Elasticsearch?.Url;
                if (string.IsNullOrEmpty(url)) return new Elastic.Clients.Elasticsearch.ElasticsearchClient();

                var settings = new Elastic.Clients.Elasticsearch.ElasticsearchClientSettings(new Uri(url));
                
                if (!string.IsNullOrEmpty(AppSettings.Elasticsearch.Username) && !string.IsNullOrEmpty(AppSettings.Elasticsearch.Password))
                {
                    settings.Authentication(new Elastic.Transport.BasicAuthentication(AppSettings.Elasticsearch.Username, AppSettings.Elasticsearch.Password));
                }
                
                if (!string.IsNullOrEmpty(AppSettings.Elasticsearch.CertificateFingerprint))
                {
                    // If it's the exact placeholder string, ignore it. Otherwise apply it.
                    if (AppSettings.Elasticsearch.CertificateFingerprint != "CHUỖI_FINGERPRINT_BẠN_VỪA_LẤY_Ở_TRÊN")
                    {
                        settings.CertificateFingerprint(AppSettings.Elasticsearch.CertificateFingerprint);
                    }
                }
                
                // Luôn bypass SSL certificate validation trong môi trường Dev/Local để tránh lỗi SSL
                settings.ServerCertificateValidationCallback(Elastic.Transport.CertificateValidations.AllowAll);

                return new Elastic.Clients.Elasticsearch.ElasticsearchClient(settings);
            });

            services.AddDependencyInjection();
            services.AddHostedService<MonthlyEvaluationBatchWorker>();

            services.AddIdentity<AppUser, AppRole>()
                 .AddEntityFrameworkStores<HinetContext>()
                 .AddDefaultTokenProviders();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidIssuer = AppSettings.AuthSetting.Issuer,
                    ValidateAudience = true,
                    ValidAudience = AppSettings.AuthSetting.Audience,
                    ValidateLifetime = true,
                    RequireExpirationTime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(AppSettings.AuthSetting.Key)),
                    ValidateIssuerSigningKey = true,
                };
            });
            //services.AddStackExchangeRedisCache(options =>
            //{
            //    options.Configuration = AppSettings.ConnectionStrings.DistCacheConnectionString;
            //    options.InstanceName = "Hinet_";
            //});


            services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;
                options.Password.RequiredUniqueChars = 1;

                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromSeconds(AppSettings.AuthSetting.SecondsExpires);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                options.User.AllowedUserNameCharacters =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                options.User.RequireUniqueEmail = false;

                // Base không có mail-confirm flow. Bật khi project con wire SendGrid/SMTP confirm.
                options.SignIn.RequireConfirmedEmail = false;
            });

            //services.ConfigureApplicationCookie(options =>
            // {
            //     // Cookie settings
            //     options.Cookie.HttpOnly = true;
            //     options.ExpireTimeSpan = TimeSpan.FromSeconds(AppSettings.AuthSetting.SecondsExpires);
            //     options.LoginPath = "/Identity/Account/Login";
            //     options.AccessDeniedPath = "/Identity/Account/AccessDenied";
            //     options.SlidingExpiration = true;
            // });

            services.ConfigureApplicationCookie(options =>
            {
                options.Cookie.HttpOnly = true;
                options.ExpireTimeSpan = TimeSpan.FromMinutes(60);
                options.LoginPath = "/Identity/Account/Login";
                options.SlidingExpiration = false;
                options.Cookie.SameSite = SameSiteMode.Strict;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            });

            //services.AddAuthentication()
            //     .AddGoogle(options =>
            //     {
            //         options.ClientId = AppSettings.ExternalAuth.GoogleAuth.ClientId;
            //         options.ClientSecret = AppSettings.ExternalAuth.GoogleAuth.ClientSecret;
            //         options.CallbackPath = "/google";
            //     });

        }

        private static void AddDependencyInjection(this IServiceCollection services)
        {

            services.AddScoped<IMapper, Mapper>();
            services.AddScoped<DbContext, HinetContext>();
            services.AddScoped<LogActionFilter>();
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            var repositoryTypes = typeof(IRepository<>).Assembly.GetTypes()
                 .Where(x => !string.IsNullOrEmpty(x.Namespace) && x.Namespace.StartsWith("Hinet.Repository") && x.Name.EndsWith("Repository"));
            foreach (var intf in repositoryTypes.Where(t => t.IsInterface))
            {
                var impl = repositoryTypes.FirstOrDefault(c => c.IsClass && intf.Name.Substring(1) == c.Name);
                if (impl != null) services.AddScoped(intf, impl);
            }

            services.AddScoped(typeof(IService<>), typeof(Service<>));
            var serviceTypes = typeof(IService<>).Assembly.GetTypes()
                 .Where(x => !string.IsNullOrEmpty(x.Namespace) && x.Namespace.StartsWith("Hinet.Service") && x.Name.EndsWith("Service"));
            foreach (var intf in serviceTypes.Where(t => t.IsInterface && t.Name != "IJobQueueService"))
            {
                var impl = serviceTypes.FirstOrDefault(c => c.IsClass && intf.Name.Substring(1) == c.Name);
                if (impl != null) services.AddScoped(intf, impl);
            }
            // Register IMongoRepository<> implementations
            services.AddScoped(typeof(IMongoRepository<>), typeof(MongoRepository<>));
            var mongoRepositoryTypes = typeof(IMongoRepository<>).Assembly.GetTypes()
                 .Where(x => !string.IsNullOrEmpty(x.Namespace) && x.Namespace.StartsWith("Hinet.Repository") && x.Name.EndsWith("MongoRepository"));
            foreach (var intf in mongoRepositoryTypes.Where(t => t.IsInterface))
            {
                var impl = mongoRepositoryTypes.FirstOrDefault(c => c.IsClass && intf.Name.Substring(1) == c.Name);
                if (impl != null) services.AddScoped(intf, impl);
            }

           // Register IMongoService<> implementations
           services.AddScoped(typeof(IMongoService<>), typeof(MongoService<>));
            var mongoServiceTypes = typeof(IMongoService<>).Assembly.GetTypes()
                 .Where(x => !string.IsNullOrEmpty(x.Namespace) && x.Namespace.StartsWith("Hinet.Service") && x.Name.EndsWith("MongoService"));
            foreach (var intf in mongoServiceTypes.Where(t => t.IsInterface))
            {
                var impl = mongoServiceTypes.FirstOrDefault(c => c.IsClass && intf.Name.Substring(1) == c.Name);
                if (impl != null) services.AddScoped(intf, impl);
            }
        }
    }

}
