using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Hinet.Model;

namespace Hinet.Api
{
    public class HinetContextFactory : IDesignTimeDbContextFactory<HinetContext>
    {
        public HinetContext CreateDbContext(string[] args)
        {
            var basePath = FindAppSettingsDirectory();
            var env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

            var configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
                .AddJsonFile($"appsettings.{env}.json", optional: true, reloadOnChange: false)
                .AddEnvironmentVariables()
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection")
                                   ?? configuration["Connections:DefaultConnection"];

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException($"Không tìm thấy chuỗi kết nối 'DefaultConnection' hoặc 'Connections:DefaultConnection' trong cấu hình tại thư mục: {basePath}");
            }

            var optionsBuilder = new DbContextOptionsBuilder<HinetContext>();
            optionsBuilder.UseSqlServer(connectionString, b => b.MigrationsAssembly("Hinet.Model"));

            return new HinetContext(optionsBuilder.Options, null!);
        }

        private static string FindAppSettingsDirectory()
        {
            var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
            while (dir != null)
            {
                var directAppSettings = Path.Combine(dir.FullName, "appsettings.json");
                if (File.Exists(directAppSettings))
                {
                    return dir.FullName;
                }

                var apiSubFolder = Path.Combine(dir.FullName, "Hinet.Api");
                if (Directory.Exists(apiSubFolder) && File.Exists(Path.Combine(apiSubFolder, "appsettings.json")))
                {
                    return apiSubFolder;
                }

                var apiNestedFolder = Path.Combine(dir.FullName, "API", "Hinet.Api");
                if (Directory.Exists(apiNestedFolder) && File.Exists(Path.Combine(apiNestedFolder, "appsettings.json")))
                {
                    return apiNestedFolder;
                }

                dir = dir.Parent;
            }

            return AppContext.BaseDirectory;
        }
    }
}
