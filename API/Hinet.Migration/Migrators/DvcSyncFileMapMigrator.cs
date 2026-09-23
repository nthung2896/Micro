using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

public class DvcSyncFileMapMigrator : IMigrator
{
    private readonly string _newConnStr;
    private readonly bool _dryRun;
    private readonly ILogger<DvcSyncFileMapMigrator> _log;

    public string Name => "DvcSyncFileMap";

    public DvcSyncFileMapMigrator(IConfiguration cfg, ILogger<DvcSyncFileMapMigrator> log)
    {
        _newConnStr = cfg.GetConnectionString("NewPostgres")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:NewPostgres");
        _dryRun = cfg.GetValue<bool?>("Migration:DryRun") ?? false;
        _log = log;
    }

    public async Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default)
    {
        const string sql = @"
CREATE TABLE IF NOT EXISTS ""DvcSyncFileMap"" (
    ""Id""                UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
    ""PlatformManageId""  UUID            NOT NULL,
    ""IdGiayTo""          VARCHAR(100),
    ""HashTepTin""        VARCHAR(200),
    ""TenFile""           VARCHAR(500),
    ""TrangThai""         INTEGER         NOT NULL DEFAULT 0,
    ""CreatedDate""       TIMESTAMP       NOT NULL DEFAULT NOW(),
    ""CreatedBy""         VARCHAR(256),
    ""CreatedId""         UUID,
    ""UpdatedDate""       TIMESTAMP       NOT NULL DEFAULT NOW(),
    ""UpdatedBy""         VARCHAR(256),
    ""UpdatedId""         UUID,
    ""IsDeleted""         BOOLEAN         NOT NULL DEFAULT FALSE,
    ""DeletedDate""       TIMESTAMP,
    ""DeletedId""         UUID
);
CREATE INDEX IF NOT EXISTS idx_dvcsyncfilemap_platformmanageid ON ""DvcSyncFileMap"" (""PlatformManageId"");
CREATE INDEX IF NOT EXISTS idx_dvcsyncfilemap_idgiayto       ON ""DvcSyncFileMap"" (""IdGiayTo"");
";

        if (_dryRun)
        {
            _log.LogInformation("[DryRun] SQL sẽ chạy:\n{Sql}", sql);
            return;
        }

        await using var conn = new NpgsqlConnection(_newConnStr);
        await conn.OpenAsync(ct);
        await conn.ExecuteAsync(sql);
        progress?.Report(new MigrationProgress("DvcSyncFileMap", 1, 1, 1, 0, 0, "✅ Done"));
        _log.LogInformation("Đã tạo bảng DvcSyncFileMap thành công.");
    }
}
