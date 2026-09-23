using Dapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

/// <summary>
/// Tạo bảng DvcSyncLog trên Postgres (idempotent).
/// Chạy: dotnet run --project API/Hinet.Migration -- --table DvcSyncLog
/// </summary>
public class DvcSyncLogMigrator : IMigrator
{
    private readonly string _newConnStr;
    private readonly bool _dryRun;
    private readonly ILogger<DvcSyncLogMigrator> _log;

    public string Name => "DvcSyncLog";

    public DvcSyncLogMigrator(IConfiguration cfg, ILogger<DvcSyncLogMigrator> log)
    {
        _newConnStr = cfg.GetConnectionString("NewPostgres")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:NewPostgres");
        _dryRun = cfg.GetValue<bool?>("Migration:DryRun") ?? false;
        _log = log;
    }

    public async Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default)
    {
        const string sql = @"
CREATE TABLE IF NOT EXISTS ""DvcSyncLog"" (
    ""Id""                UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
    ""ActionType""        VARCHAR(50)     NOT NULL,
    ""RequestUrl""        VARCHAR(1000)   NOT NULL,
    ""RequestBody""       TEXT,
    ""ResponseBody""      TEXT,
    ""StatusCode""        INTEGER         NOT NULL,
    ""IsSuccess""         BOOLEAN         NOT NULL,
    ""ErrorMessage""      TEXT,
    ""DurationMs""        BIGINT          NOT NULL DEFAULT 0,
    ""RetryCount""        INTEGER         NOT NULL DEFAULT 0,
    ""MaxRetry""          INTEGER         NOT NULL DEFAULT 3,
    ""MaHoSo""            VARCHAR(100),
    ""IdHoSo""            VARCHAR(100),

    -- Audit fields
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

-- Index
CREATE INDEX IF NOT EXISTS idx_dvcsynclog_actiontype   ON ""DvcSyncLog"" (""ActionType"");
CREATE INDEX IF NOT EXISTS idx_dvcsynclog_issuccess     ON ""DvcSyncLog"" (""IsSuccess"");
CREATE INDEX IF NOT EXISTS idx_dvcsynclog_mahoso        ON ""DvcSyncLog"" (""MaHoSo"");
CREATE INDEX IF NOT EXISTS idx_dvcsynclog_createddate   ON ""DvcSyncLog"" (""CreatedDate"" DESC);
CREATE INDEX IF NOT EXISTS idx_dvcsynclog_isdeleted     ON ""DvcSyncLog"" (""IsDeleted"");
";

        if (_dryRun)
        {
            _log.LogInformation("[DryRun] SQL sẽ chạy:\n{Sql}", sql);
            return;
        }

        await using var conn = new NpgsqlConnection(_newConnStr);
        await conn.OpenAsync();
        await conn.ExecuteAsync(sql);

        // Drop SourceToken nếu còn từ bản cũ
        await conn.ExecuteAsync(@"ALTER TABLE ""DvcSyncLog"" DROP COLUMN IF EXISTS ""SourceToken"";");

        progress?.Report(new MigrationProgress("DvcSyncLog", 1, 1, 1, 0, 0, "✅ Done"));
        _log.LogInformation("Đã tạo bảng DvcSyncLog thành công.");
    }
}
