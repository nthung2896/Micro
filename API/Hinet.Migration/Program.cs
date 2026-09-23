using Hinet.Migration;
using Hinet.Migration.Migrators;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Console;
using Npgsql;
using Dapper;

// =====================================================================
// Hinet.Migration - console app migrate SQL Server -> Postgres.
//
// Interactive menu (default):
//   dotnet run --project API/Hinet.Migration
//
// CLI mode:
//   dotnet run --project API/Hinet.Migration -- --table CompanyInfo
//   dotnet run --project API/Hinet.Migration -- --table all --dry-run
// =====================================================================

var builder = Host.CreateApplicationBuilder(args);

builder.Configuration
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false);

builder.Logging.ClearProviders();
builder.Logging.AddConsole(o =>
{
    o.FormatterName = "hinet";
});
builder.Logging.AddConsoleFormatter<HinetConsoleFormatter, ConsoleFormatterOptions>();

RegisterMigrators(builder.Services);
builder.Services.AddSingleton<InteractiveMenu>();

using var host = builder.Build();

var log = host.Services.GetRequiredService<ILogger<Program>>();

// Auto-ensure schema _migration on Postgres
await EnsureMigrationSchemaAsync(host.Services.GetRequiredService<IConfiguration>(), log);

// Parse CLI args
var tableArg = GetArg(args, "--table");
var limitArg = GetArg(args, "--limit");
var dryRun = args.Contains("--dry-run", StringComparer.OrdinalIgnoreCase);

// If --table provided -> CLI mode
if (tableArg != null)
{
    var cfg = host.Services.GetRequiredService<IConfiguration>();
    if (dryRun)
    {
        cfg["Migration:DryRun"] = "true";
    }
    if (!string.IsNullOrEmpty(limitArg))
    {
        cfg["Migration:Limit"] = limitArg;
    }

    var migrators = host.Services.GetServices<IMigrator>().ToList();

    if (tableArg.Equals("list", StringComparison.OrdinalIgnoreCase))
    {
        log.LogInformation("Bang co the migrate (--table <name>):");
        foreach (var m in migrators) log.LogInformation("  - {Name}", m.Name);
        return;
    }

    if (tableArg.Equals("all", StringComparison.OrdinalIgnoreCase))
    {
        foreach (var m in migrators)
        {
            log.LogInformation("> Migrate {Name}...", m.Name);
            try
            {
                await m.RunAsync(ct: CancellationToken.None);
                log.LogInformation("[OK] {Name} hoan tat.", m.Name);
            }
            catch (Exception ex)
            {
                log.LogError(ex, "[FAIL] {Name} that bai!", m.Name);
            }
        }
        return;
    }

    var target = migrators.FirstOrDefault(m => m.Name.Equals(tableArg, StringComparison.OrdinalIgnoreCase));
    if (target is null)
    {
        log.LogError("Khong co migrator nao ten '{Arg}'. Chay khong co --table de xem list.", tableArg);
        Environment.ExitCode = 1;
        return;
    }

    try
    {
        await target.RunAsync(ct: CancellationToken.None);
    }
    catch (Exception ex)
    {
        log.LogCritical(ex, "Migrator '{Name}' that bai", target.Name);
        Environment.ExitCode = 2;
    }
    return;
}

// Interactive menu
var menu = host.Services.GetRequiredService<InteractiveMenu>();
await menu.RunAsync();

return;

// =====================================================================
// Helpers
// =====================================================================

static void RegisterMigrators(IServiceCollection services)
{
    services.AddSingleton<IMigrator, CompanyInfoMigrator>();
    services.AddSingleton<IMigrator, AppUserMigrator>();
    services.AddSingleton<IMigrator, RoleMigrator>();
    services.AddSingleton<IMigrator, UserRoleMigrator>();
    services.AddSingleton<IMigrator, ModuleMigrator>();
    services.AddSingleton<IMigrator, OperationMigrator>();
    services.AddSingleton<IMigrator, RoleOperationMigrator>();
    services.AddSingleton<IMigrator, WebsiteInfoMigrator>();
    services.AddSingleton<IMigrator, AppInfoMigrator>();
    services.AddSingleton<IMigrator, AuthenticationContractMigrator>();
    services.AddSingleton<IMigrator, WebsiteFileMigrator>();
    services.AddSingleton<IMigrator, AppFileMigrator>();
    services.AddSingleton<IMigrator, DvcSyncLogMigrator>();
    services.AddSingleton<IMigrator, PlatformManageDvcFieldsMigrator>();
    services.AddSingleton<IMigrator, DvcSyncFileMapMigrator>();
    services.AddSingleton<IMigrator, AuthConstractCategoryMigrator>();
    services.AddSingleton<IMigrator, ContractFileMigrator>();
}

static string? GetArg(string[] args, string name)
{
    for (int i = 0; i < args.Length - 1; i++)
    {
        if (args[i].Equals(name, StringComparison.OrdinalIgnoreCase))
            return args[i + 1];
    }
    return null;
}

static async Task EnsureMigrationSchemaAsync(IConfiguration cfg, ILogger log)
{
    var connStr = cfg.GetConnectionString("NewPostgres")
        ?? throw new InvalidOperationException("Missing ConnectionStrings:NewPostgres");
    var sqlPath = Path.Combine(AppContext.BaseDirectory, "Sql", "001_create_map_tables.sql");
    if (!File.Exists(sqlPath))
    {
        log.LogWarning("Khong tim thay {Path} -- bo qua ensure schema", sqlPath);
        return;
    }

    var sql = await File.ReadAllTextAsync(sqlPath);
    await using var conn = new NpgsqlConnection(connStr);
    await conn.OpenAsync();
    await using var cmd = new NpgsqlCommand(sql, conn);
    await cmd.ExecuteNonQueryAsync();
    log.LogInformation("Schema _migration: OK (da chay {Path})", Path.GetFileName(sqlPath));
}
