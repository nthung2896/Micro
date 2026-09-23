using Hinet.Migration.Migrators;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration;

public class InteractiveMenu
{
    private readonly IEnumerable<IMigrator> _migrators;
    private readonly ILogger<InteractiveMenu> _log;
    private readonly string _newConnStr;

    public InteractiveMenu(IEnumerable<IMigrator> migrators, ILogger<InteractiveMenu> log, IConfiguration cfg)
    {
        _migrators = migrators;
        _log = log;
        _newConnStr = cfg.GetConnectionString("NewPostgres")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:NewPostgres");
    }

    public async Task RunAsync(CancellationToken ct = default)
    {
        while (!ct.IsCancellationRequested)
        {
            ShowHeader();
            ShowMenu();

            var choice = Prompt("> Nhap lua chon: ").Trim();

            switch (choice)
            {
                case "1":
                    await RunMigrationFlow(ct, resetFirst: false);
                    break;
                case "2":
                    await RunMigrationFlow(ct, resetFirst: true);
                    break;
                case "3":
                    await RunDeleteFlow(ct);
                    break;
                case "4":
                    Console.WriteLine("Tam biet!");
                    return;
                default:
                    Console.WriteLine("Lua chon khong hop le. Vui long chon 1-4.");
                    WaitAnyKey();
                    break;
            }
        }
    }

    private async Task RunMigrationFlow(CancellationToken ct, bool resetFirst = false)
    {
        var migrator = SelectTable();
        if (migrator == null) return;

        Console.WriteLine();
        Console.WriteLine("========================");
        Console.WriteLine($"  Bang chon: {migrator.Name}");
        Console.WriteLine("========================");

        var confirm = Prompt("  Ban co chac muon migrate? (y/n): ").Trim().ToLower();
        if (confirm != "y" && confirm != "yes")
        {
            Console.WriteLine("Da huy. Quay lai menu.");
            WaitAnyKey();
            return;
        }

        if (resetFirst)
        {
            Console.WriteLine("Dang xoa du lieu cu...");
            await ResetMappingData(migrator);
            Console.WriteLine("Xoa xong!");
        }

        Console.WriteLine();
        Console.WriteLine("DANG TIEN HANH MIGRATE...");

        var progress = new Progress<MigrationProgress>(p => PrintProgress(p));

        try
        {
            await migrator.RunAsync(progress: progress, ct: ct);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Migrate that bai: {ex.Message}");
        }

        Console.WriteLine();
        Console.WriteLine("Hoan tat! Nhan phim bat ky de quay lai menu.");
        WaitAnyKey();
    }

    private async Task RunDeleteFlow(CancellationToken ct)
    {
        var migrator = SelectTable();
        if (migrator == null) return;

        Console.WriteLine();
        Console.WriteLine("========================");
        Console.WriteLine($"  Bang chon: {migrator.Name}");
        Console.WriteLine("========================");

        var confirm = Prompt("  Ban co chac muon xoa du lieu? (y/n): ").Trim().ToLower();
        if (confirm != "y" && confirm != "yes")
        {
            Console.WriteLine("Da huy. Quay lai menu.");
            WaitAnyKey();
            return;
        }

        Console.WriteLine("Dang xoa du lieu cu...");
        await ResetMappingData(migrator);
        Console.WriteLine("Xoa xong! Nhan phim bat ky de quay lai menu.");
        WaitAnyKey();
    }

    private IMigrator? SelectTable()
    {
        var list = _migrators.OrderBy(m => m.Name).ToList();

        Console.WriteLine();
        Console.WriteLine("=== CHON BANG CAN MIGRATE ===");
        Console.WriteLine("Nhap so thu tu de chon, '0' de quay lai.");
        Console.WriteLine();

        for (int i = 0; i < list.Count; i++)
        {
            Console.WriteLine($"  [{i + 1,2}] {list[i].Name}");
        }

        Console.WriteLine();
        var input = Prompt("> Nhap lua chon: ").Trim();

        if (input == "0") return null;
        if (int.TryParse(input, out int idx) && idx >= 1 && idx <= list.Count)
            return list[idx - 1];

        Console.WriteLine("So khong hop le.");
        WaitAnyKey();
        return null;
    }

    private async Task ResetMappingData(IMigrator migrator)
    {
        // Map migrator name -> (mapping table, destination table)
        var resetInfo = new Dictionary<string, (string MapTable, string DestTable)>(StringComparer.OrdinalIgnoreCase)
        {
            ["CompanyInfo"]       = ("_migration.company_id_map",       "public.\"CompanyInfo\""),
            ["AppUser"]           = ("_migration.user_id_map",         "public.\"AspNetUsers\""),
            ["Role"]              = ("_migration.role_id_map",          "public.\"Role\""),
            ["UserRole"]          = ("_migration.user_id_map",         "public.\"UserRole\""), // cascade
            ["Module"]            = ("_migration.module_id_map",        "public.\"Module\""),
            ["Operation"]         = ("_migration.operation_id_map",     "public.\"Operation\""),
            ["RoleOperation"]     = ("_migration.role_id_map",          "public.\"RoleOperation\""),
            ["WebsiteInfo"]       = ("_migration.website_id_map",       "public.\"PlatformManage\""),
            ["AppInfo"]           = ("_migration.app_id_map",           "public.\"PlatformManage\""),
            ["AuthenticationContract"] = ("_migration.authcontract_id_map", "public.\"AuthenticationContract\""),
            ["AuthConstractCategory"] = ("_migration.authcontractcategory_id_map", "public.\"AuthConstractCategory\""),
            ["WebsiteFile"]       = ("_migration.website_file_id_map",  "public.\"TaiLieuDinhKem\""),
            ["AppFile"]           = ("_migration.app_file_id_map",      "public.\"TaiLieuDinhKem\""),
            ["ContractFile"]      = ("_migration.contract_file_id_map", "public.\"TaiLieuDinhKem\""),
            ["DvcSyncLog"]        = ("_migration.dummy",               "public.\"DvcSyncLog\""),
            ["PlatformManageDvc"] = ("_migration.dummy",               "public.\"PlatformManage\""),
            ["DvcSyncFileMap"]    = ("_migration.dummy",               "public.\"DvcSyncFileMap\""),
        };

        if (!resetInfo.TryGetValue(migrator.Name, out var info)) return;

        await using var conn = new NpgsqlConnection(_newConnStr);
        await conn.OpenAsync();

        if (migrator.Name == "UserRole" || migrator.Name == "RoleOperation")
        {
            // These depend on mapping tables, just delete from dest
            await using var cmd = new NpgsqlCommand($"DELETE FROM {info.DestTable}", conn);
            await cmd.ExecuteNonQueryAsync();
            return;
        }

        // Delete from dest table first (FK constraints), then truncate map
        await using var delCmd = new NpgsqlCommand($"DELETE FROM {info.DestTable}", conn);
        await delCmd.ExecuteNonQueryAsync();

        if (!info.MapTable.Contains("dummy"))
        {
            await using var mapCmd = new NpgsqlCommand($"DELETE FROM {info.MapTable}", conn);
            await mapCmd.ExecuteNonQueryAsync();
        }
    }

    private static void PrintProgress(MigrationProgress p)
    {
        var pct = p.Total > 0 ? (p.Processed * 100 / p.Total) : 0;
        var barLen = 30;
        var filled = pct * barLen / 100;
        var bar = new string('#', filled) + new string('.', barLen - filled);

        Console.Write($"\r  [{p.TableName,-16}] [{bar}] {p.Processed}/{p.Total} "
            + $"(OK:{p.Inserted} Skip:{p.Skipped} Err:{p.Errors})");

        if (p.Processed >= p.Total && p.Total > 0)
            Console.WriteLine();
    }

    private static void ShowHeader()
    {
        Console.Clear();
        Console.WriteLine(@"
+----------------------------------------------+
|            HINET MIGRATION TOOL               |
|    Cong cu dong bo du lieu SQL Server -> PG   |
+----------------------------------------------+");
        Console.WriteLine();
    }

    private static void ShowMenu()
    {
        Console.WriteLine("  [1] Chon bang va migrate");
        Console.WriteLine("  [2] Xoa du lieu va migrate lai");
        Console.WriteLine("  [3] Xoa du lieu (chi xoa, ko migrate)");
        Console.WriteLine("  [4] Thoat");
        Console.WriteLine();
    }

    private static string Prompt(string message)
    {
        Console.Write(message);
        return Console.ReadLine() ?? "";
    }

    private static void WaitAnyKey()
    {
        Console.Write("Nhan phim bat ky de tiep tuc...");
        Console.ReadKey(true);
    }
}
