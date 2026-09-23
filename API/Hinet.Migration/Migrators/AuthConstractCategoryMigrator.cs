using System.Data;
using Dapper;
using Hinet.Migration.OldModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

public class AuthConstractCategoryMigrator : IMigrator
{
    private readonly string _oldConnStr;
    private readonly string _newConnStr;
    private readonly int _batchSize;
    private readonly bool _dryRun;
    private readonly ILogger<AuthConstractCategoryMigrator> _log;

    public string Name => "AuthConstractCategory";

    public AuthConstractCategoryMigrator(IConfiguration cfg, ILogger<AuthConstractCategoryMigrator> log)
    {
        _oldConnStr = cfg.GetConnectionString("OldSqlServer")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:OldSqlServer");
        _newConnStr = cfg.GetConnectionString("NewPostgres")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:NewPostgres");
        _batchSize = cfg.GetValue<int?>("Migration:BatchSize") ?? 500;
        _dryRun = cfg.GetValue<bool?>("Migration:DryRun") ?? false;
        _log = log;
    }

    public async Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default)
    {
        _log.LogInformation("=== Bắt đầu migrate AuthConstractCategory (DryRun={DryRun}, Batch={Batch}) ===",
            _dryRun, _batchSize);

        await using var oldDb = new SqlConnection(_oldConnStr);
        await oldDb.OpenAsync(ct);

        await using var newDb = new NpgsqlConnection(_newConnStr);
        await newDb.OpenAsync(ct);

        var totalOld = await oldDb.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM dbo.AuthConstactCategory");
        _log.LogInformation("Tổng dòng DB cũ: {Total}", totalOld);

        long lastId = 0;
        int processed = 0, inserted = 0, skipped = 0, errors = 0, missingContract = 0;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            var batch = (await oldDb.QueryAsync<OldAuthConstractCategory>(@"
                SELECT TOP (@Take)
                    Id, AuthConstactId, TypeValue,
                    CreatedDate, CreatedBy, CreatedID,
                    UpdatedDate, UpdatedBy, UpdatedID
                FROM dbo.AuthConstactCategory
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
                    // === Idempotent check ===
                    var existingNewId = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.authcontractcategory_id_map WHERE old_id=@id",
                        new { id = old.Id });
                    if (existingNewId.HasValue)
                    {
                        skipped++;
                        continue;
                    }

                    // === Lookup AuthenticationContract mapping (Required) ===
                    var authContractId = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.authcontract_id_map WHERE old_id=@id",
                        new { id = old.AuthConstactId });

                    if (!authContractId.HasValue)
                    {
                        missingContract++;
                        await LogErrorAsync(newDb, old.Id, $"Không tìm thấy AuthenticationContract mapping cho AuthConstactId={old.AuthConstactId}");
                        continue;
                    }

                    var newId = Guid.NewGuid();

                    // === Lookup FK user_id_map ===
                    var createdId = await LookupUserAsync(newDb, old.CreatedID);
                    var updatedId = await LookupUserAsync(newDb, old.UpdatedID);

                    if (_dryRun)
                    {
                        inserted++;
                        continue;
                    }

                    // === INSERT vào AuthConstractCategory mới ===
                    await using var tx = await newDb.BeginTransactionAsync(ct);
                    await newDb.ExecuteAsync(@"
                        INSERT INTO public.""AuthConstractCategory"" (
                            ""Id"", ""AuthContractId"", ""LinhVucCungCapDichVuCode"",
                            ""CreatedDate"", ""CreatedBy"", ""CreatedId"",
                            ""UpdatedDate"", ""UpdatedBy"", ""UpdatedId"",
                            ""IsDeleted""
                        ) VALUES (
                            @Id, @AuthContractId, @LinhVucCungCapDichVuCode,
                            @CreatedDate, @CreatedBy, @CreatedId,
                            @UpdatedDate, @UpdatedBy, @UpdatedId,
                            false
                        )",
                        new
                        {
                            Id = newId,
                            AuthContractId = authContractId.Value,
                            LinhVucCungCapDichVuCode = Clean(old.TypeValue) ?? "",
                            CreatedDate = NormalizeDate(old.CreatedDate),
                            CreatedBy = Clean(old.CreatedBy),
                            CreatedId = createdId,
                            UpdatedDate = NormalizeDate(old.UpdatedDate == default ? old.CreatedDate : old.UpdatedDate),
                            UpdatedBy = Clean(old.UpdatedBy),
                            UpdatedId = updatedId
                        }, transaction: tx);

                    await newDb.ExecuteAsync(@"
                        INSERT INTO _migration.authcontractcategory_id_map (old_id, new_id)
                        VALUES (@OldId, @NewId)",
                        new { OldId = old.Id, NewId = newId }, transaction: tx);

                    await tx.CommitAsync(ct);
                    inserted++;
                }
                catch (Exception ex)
                {
                    errors++;
                    _log.LogError(ex, "Lỗi migrate AuthConstractCategory Id={OldId}", old.Id);
                    if (!_dryRun)
                    {
                        await LogErrorAsync(newDb, old.Id, ex.Message);
                    }
                }
            }

            progress?.Report(new MigrationProgress("AuthConstractCategory", totalOld, processed, inserted, skipped, errors,
                $"lastId={lastId}"));
            _log.LogInformation(
                "Tiến độ: processed={Processed}/{Total} inserted={Inserted} skipped={Skipped} errors={Errors} missingContract={MissingContract} lastId={LastId}",
                processed, totalOld, inserted, skipped, errors, missingContract, lastId);
        }

        progress?.Report(new MigrationProgress("AuthConstractCategory", totalOld, totalOld, inserted, skipped, errors, "✅ Done"));
        _log.LogInformation(
            "=== Hoàn tất AuthConstractCategory: processed={Processed} inserted={Inserted} skipped={Skipped} errors={Errors} missingContract={MissingContract} ===",
            processed, inserted, skipped, errors, missingContract);
    }

    private static string? Clean(string? s) => s?.Replace("\0", "").Trim();

    private static DateTime NormalizeDate(DateTime d) =>
        d < new DateTime(1900, 1, 1) ? DateTime.UtcNow : d;

    private static async Task<Guid?> LookupUserAsync(IDbConnection newDb, long? oldUserId)
    {
        if (!oldUserId.HasValue) return null;
        return await newDb.ExecuteScalarAsync<Guid?>(
            @"SELECT new_id FROM _migration.user_id_map WHERE old_id=@id",
            new { id = oldUserId.Value });
    }

    private static async Task LogErrorAsync(IDbConnection newDb, long oldId, string reason)
    {
        try
        {
            await newDb.ExecuteAsync(@"
                INSERT INTO _migration.error_log (table_name, old_id, reason)
                VALUES (@T, @Id, @Reason)",
                new { T = "AuthConstractCategory", Id = oldId, Reason = reason });
        }
        catch { /* không để log lỗi làm fail thêm */ }
    }
}
