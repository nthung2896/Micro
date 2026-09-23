using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

/// <summary>
/// Thêm cột DVC vào bảng PlatformManage (idempotent).
/// Chạy: dotnet run --project API/Hinet.Migration -- --table PlatformManageDvc
/// </summary>
public class PlatformManageDvcFieldsMigrator : IMigrator
{
    private readonly string _newConnStr;
    private readonly bool _dryRun;
    private readonly ILogger<PlatformManageDvcFieldsMigrator> _log;

    public string Name => "PlatformManageDvc";

    public PlatformManageDvcFieldsMigrator(IConfiguration cfg, ILogger<PlatformManageDvcFieldsMigrator> log)
    {
        _newConnStr = cfg.GetConnectionString("NewPostgres")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:NewPostgres");
        _dryRun = cfg.GetValue<bool?>("Migration:DryRun") ?? false;
        _log = log;
    }

    public async Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default)
    {
        const string sql = @"
ALTER TABLE ""PlatformManage""
  ADD COLUMN IF NOT EXISTS ""DvcMaHoSo""       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ""DvcIdHoSo""       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ""DvcSyncStatus""   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ""DvcSyncDate""     TIMESTAMP,
  ADD COLUMN IF NOT EXISTS ""DvcRetryCount""   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ""DvcErrorMessage"" TEXT;

CREATE INDEX IF NOT EXISTS idx_platformmanage_dvc_mahoso ON ""PlatformManage"" (""DvcMaHoSo"");
";

        if (_dryRun)
        {
            _log.LogInformation("[DryRun] SQL sẽ chạy:\n{Sql}", sql);
            return;
        }

        await using var conn = new NpgsqlConnection(_newConnStr);
        await conn.OpenAsync(ct);
        await conn.ExecuteAsync(sql);

        progress?.Report(new MigrationProgress("PlatformManageDvc", 1, 1, 1, 0, 0, "✅ Done"));
        _log.LogInformation("Đã thêm cột DVC vào bảng PlatformManage thành công.");
    }
}
