using System.Data;
using Dapper;
using Hinet.Migration.OldModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

// dbo.RoleOperation (bigint Id, RoleId int, OperationId bigint) →
// public."RoleOperation" (uuid Id, RoleId uuid, OperationId uuid).
//
// Prerequisites: Role + Operation đã migrate.
public class RoleOperationMigrator : IMigrator
{
    private readonly string _oldConnStr;
    private readonly string _newConnStr;
    private readonly int _batchSize;
    private readonly bool _dryRun;
    private readonly ILogger<RoleOperationMigrator> _log;

    public string Name => "RoleOperation";

    public RoleOperationMigrator(IConfiguration cfg, ILogger<RoleOperationMigrator> log)
    {
        _oldConnStr = cfg.GetConnectionString("OldSqlServer")!;
        _newConnStr = cfg.GetConnectionString("NewPostgres")!;
        _batchSize = cfg.GetValue<int?>("Migration:BatchSize") ?? 500;
        _dryRun = cfg.GetValue<bool?>("Migration:DryRun") ?? false;
        _log = log;
    }

    public async Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default)
    {
        _log.LogInformation("=== Migrate RoleOperation (DryRun={DryRun}) ===", _dryRun);

        await using var oldDb = new SqlConnection(_oldConnStr);
        await oldDb.OpenAsync(ct);
        await using var newDb = new NpgsqlConnection(_newConnStr);
        await newDb.OpenAsync(ct);

        var roleMap = await newDb.ExecuteScalarAsync<long>("SELECT COUNT(*) FROM _migration.role_id_map");
        var opMap   = await newDb.ExecuteScalarAsync<long>("SELECT COUNT(*) FROM _migration.operation_id_map");
        if (roleMap == 0 || opMap == 0)
        {
            _log.LogError("Thiếu role_id_map ({R}) hoặc operation_id_map ({O}). Migrate trước.",
                roleMap, opMap);
            return;
        }

        var total = await oldDb.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM dbo.RoleOperation");
        _log.LogInformation("Tổng RoleOperation cũ: {N}", total);

        long lastId = 0;
        int processed = 0, inserted = 0, skipped = 0, missingFk = 0, dup = 0, errors = 0;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            var batch = (await oldDb.QueryAsync<OldRoleOperation>(@"
                SELECT TOP (@Take) Id, RoleId, OperationId, IsAccess,
                    CreatedDate, CreatedBy, CreatedID, UpdatedDate, UpdatedBy, UpdatedID
                FROM dbo.RoleOperation
                WHERE Id > @LastId
                ORDER BY Id",
                new { Take = _batchSize, LastId = lastId })).ToList();

            if (batch.Count == 0) break;

            foreach (var old in batch)
            {
                processed++;
                lastId = old.Id;

                try
                {
                    var roleNewId = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.role_id_map WHERE old_id=@id",
                        new { id = (long)old.RoleId });
                    var opNewId = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.operation_id_map WHERE old_id=@id",
                        new { id = old.OperationId });

                    if (!roleNewId.HasValue || !opNewId.HasValue)
                    {
                        missingFk++;
                        await LogErrorAsync(newDb, old.Id,
                            $"Missing FK: RoleId={old.RoleId} ({roleNewId.HasValue}), OperationId={old.OperationId} ({opNewId.HasValue})");
                        continue;
                    }

                    // Idempotent: skip nếu cặp đã có
                    var dupExists = await newDb.ExecuteScalarAsync<bool>(@"
                        SELECT EXISTS(SELECT 1 FROM public.""RoleOperation""
                                      WHERE ""RoleId""=@r AND ""OperationId""=@o)",
                        new { r = roleNewId.Value, o = opNewId.Value });
                    if (dupExists) { dup++; continue; }

                    if (_dryRun) { inserted++; continue; }

                    var createdId = await LookupUserAsync(newDb, old.CreatedID);
                    var updatedId = await LookupUserAsync(newDb, old.UpdatedID);

                    await newDb.ExecuteAsync(@"
                        INSERT INTO public.""RoleOperation"" (
                            ""Id"", ""RoleId"", ""OperationId"", ""IsAccess"",
                            ""CreatedDate"", ""CreatedBy"", ""CreatedId"",
                            ""UpdatedDate"", ""UpdatedBy"", ""UpdatedId"",
                            ""IsDeleted"", ""DeletedDate"", ""DeletedId""
                        ) VALUES (
                            @Id, @RoleId, @OperationId, @IsAccess,
                            @CreatedDate, @CreatedBy, @CreatedId,
                            @UpdatedDate, @UpdatedBy, @UpdatedId,
                            FALSE, NULL, NULL
                        )",
                        new
                        {
                            Id = Guid.NewGuid(),
                            RoleId = roleNewId.Value,
                            OperationId = opNewId.Value,
                            old.IsAccess,
                            CreatedDate = NormalizeDate(old.CreatedDate),
                            old.CreatedBy, CreatedId = createdId,
                            UpdatedDate = NormalizeDate(old.UpdatedDate == default ? old.CreatedDate : old.UpdatedDate),
                            old.UpdatedBy, UpdatedId = updatedId,
                        });

                    inserted++;
                }
                catch (Exception ex)
                {
                    errors++;
                    _log.LogError(ex, "Lỗi RoleOperation Id={OldId}", old.Id);
                    if (!_dryRun) await LogErrorAsync(newDb, old.Id, ex.Message);
                }
            }

            _log.LogInformation(
                "Progress: {P}/{T} inserted={I} dup={D} missingFk={M} errors={E} lastId={L}",
                processed, total, inserted, dup, missingFk, errors, lastId);

            progress?.Report(new MigrationProgress("RoleOperation", total, processed, inserted, skipped, errors,
                $"dup={dup} missingFk={missingFk} lastId={lastId}"));
        }

        progress?.Report(new MigrationProgress("RoleOperation", total, total, inserted, skipped, errors, "✅ Done"));
        _log.LogInformation(
            "=== RoleOperation xong: inserted={I} skipped={S} dup={D} missingFk={M} errors={E} ===",
            inserted, skipped, dup, missingFk, errors);
    }

    private static DateTime NormalizeDate(DateTime d) =>
        d < new DateTime(1900, 1, 1) ? DateTime.UtcNow : d;

    private static async Task<Guid?> LookupUserAsync(IDbConnection newDb, long? oldUserId) =>
        !oldUserId.HasValue ? null : await newDb.ExecuteScalarAsync<Guid?>(
            @"SELECT new_id FROM _migration.user_id_map WHERE old_id=@id",
            new { id = oldUserId.Value });

    private static async Task LogErrorAsync(IDbConnection newDb, long oldId, string reason)
    {
        try
        {
            await newDb.ExecuteAsync(@"
                INSERT INTO _migration.error_log (table_name, old_id, reason)
                VALUES (@T, @Id, @Reason)",
                new { T = "RoleOperation", Id = oldId, Reason = reason });
        }
        catch { }
    }
}
