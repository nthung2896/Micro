using System.Data;
using Dapper;
using Hinet.Migration.OldModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

// dbo.Operation (bigint Id, ModuleId int) → public."Operation" (uuid Id, ModuleId uuid).
// Prerequisite: Module đã migrate (cần module_id_map).
public class OperationMigrator : IMigrator
{
    private readonly string _oldConnStr;
    private readonly string _newConnStr;
    private readonly int _batchSize;
    private readonly bool _dryRun;
    private readonly ILogger<OperationMigrator> _log;

    public string Name => "Operation";

    public OperationMigrator(IConfiguration cfg, ILogger<OperationMigrator> log)
    {
        _oldConnStr = cfg.GetConnectionString("OldSqlServer")!;
        _newConnStr = cfg.GetConnectionString("NewPostgres")!;
        _batchSize = cfg.GetValue<int?>("Migration:BatchSize") ?? 500;
        _dryRun = cfg.GetValue<bool?>("Migration:DryRun") ?? false;
        _log = log;
    }

    public async Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default)
    {
        _log.LogInformation("=== Migrate Operation (DryRun={DryRun}) ===", _dryRun);

        await using var oldDb = new SqlConnection(_oldConnStr);
        await oldDb.OpenAsync(ct);
        await using var newDb = new NpgsqlConnection(_newConnStr);
        await newDb.OpenAsync(ct);

        var moduleMapCount = await newDb.ExecuteScalarAsync<long>(
            "SELECT COUNT(*) FROM _migration.module_id_map");
        if (moduleMapCount == 0)
        {
            _log.LogError("module_id_map rỗng — migrate Module trước.");
            return;
        }

        var total = await oldDb.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM dbo.Operation");
        _log.LogInformation("Tổng Operation cũ: {N}", total);

        long lastId = 0;
        int processed = 0, inserted = 0, skipped = 0, missingFk = 0, errors = 0;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            var batch = (await oldDb.QueryAsync<OldOperation>(@"
                SELECT TOP (@Take) Id, ModuleId, Name, URL, Code, Css, IsShow, [Order],
                    CreatedDate, CreatedBy, CreatedID, UpdatedDate, UpdatedBy, UpdatedID
                FROM dbo.Operation
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
                    var existing = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.operation_id_map WHERE old_id=@id",
                        new { id = old.Id });
                    if (existing.HasValue) { skipped++; continue; }

                    var moduleNewId = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.module_id_map WHERE old_id=@id",
                        new { id = (long)old.ModuleId });
                    if (!moduleNewId.HasValue)
                    {
                        missingFk++;
                        await LogErrorAsync(newDb, old.Id, $"Missing module mapping: ModuleId={old.ModuleId}");
                        continue;
                    }

                    var newId = Guid.NewGuid();
                    if (_dryRun) { inserted++; continue; }

                    var createdId = await LookupUserAsync(newDb, old.CreatedID);
                    var updatedId = await LookupUserAsync(newDb, old.UpdatedID);

                    await using var tx = await newDb.BeginTransactionAsync(ct);
                    await newDb.ExecuteAsync(@"
                        INSERT INTO public.""Operation"" (
                            ""Id"", ""ModuleId"", ""Name"", ""Url"", ""Code"", ""Css"",
                            ""IsShow"", ""Order"", ""Icon"",
                            ""CreatedDate"", ""CreatedBy"", ""CreatedId"",
                            ""UpdatedDate"", ""UpdatedBy"", ""UpdatedId"",
                            ""IsDeleted"", ""DeletedDate"", ""DeletedId""
                        ) VALUES (
                            @Id, @ModuleId, @Name, @Url, @Code, @Css,
                            @IsShow, @Order, NULL,
                            @CreatedDate, @CreatedBy, @CreatedId,
                            @UpdatedDate, @UpdatedBy, @UpdatedId,
                            FALSE, NULL, NULL
                        )",
                        new
                        {
                            Id = newId,
                            ModuleId = moduleNewId.Value,
                            old.Name,
                            Url = old.URL,
                            old.Code,
                            old.Css,
                            old.IsShow,
                            old.Order,
                            CreatedDate = NormalizeDate(old.CreatedDate),
                            old.CreatedBy, CreatedId = createdId,
                            UpdatedDate = NormalizeDate(old.UpdatedDate == default ? old.CreatedDate : old.UpdatedDate),
                            old.UpdatedBy, UpdatedId = updatedId,
                        }, transaction: tx);

                    await newDb.ExecuteAsync(@"
                        INSERT INTO _migration.operation_id_map (old_id, new_id) VALUES (@OldId, @NewId)",
                        new { OldId = old.Id, NewId = newId }, transaction: tx);

                    await tx.CommitAsync(ct);
                    inserted++;
                }
                catch (Exception ex)
                {
                    errors++;
                    _log.LogError(ex, "Lỗi Operation Id={OldId}", old.Id);
                    if (!_dryRun) await LogErrorAsync(newDb, old.Id, ex.Message);
                }
            }

            _log.LogInformation(
                "Progress: {P}/{T} inserted={I} missingFk={M} errors={E} lastId={L}",
                processed, total, inserted, missingFk, errors, lastId);

            progress?.Report(new MigrationProgress("Operation", total, processed, inserted, skipped, errors,
                $"missingFk={missingFk} lastId={lastId}"));
        }

        progress?.Report(new MigrationProgress("Operation", total, total, inserted, skipped, errors, "✅ Done"));
        _log.LogInformation(
            "=== Operation xong: inserted={I} skipped={S} missingFk={M} errors={E} ===",
            inserted, skipped, missingFk, errors);
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
                new { T = "Operation", Id = oldId, Reason = reason });
        }
        catch { }
    }
}
