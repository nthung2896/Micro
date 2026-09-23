using System.Data;
using Dapper;
using Hinet.Migration.OldModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

// Migrate dbo.Role (int Id) → public."Role" (uuid Id).
// Tạo mapping vào _migration.role_id_map cho UserRole/RoleOperation lookup sau.
public class RoleMigrator : IMigrator
{
    private readonly string _oldConnStr;
    private readonly string _newConnStr;
    private readonly bool _dryRun;
    private readonly ILogger<RoleMigrator> _log;

    public string Name => "Role";

    public RoleMigrator(IConfiguration cfg, ILogger<RoleMigrator> log)
    {
        _oldConnStr = cfg.GetConnectionString("OldSqlServer")!;
        _newConnStr = cfg.GetConnectionString("NewPostgres")!;
        _dryRun = cfg.GetValue<bool?>("Migration:DryRun") ?? false;
        _log = log;
    }

    public async Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default)
    {
        _log.LogInformation("=== Migrate Role (DryRun={DryRun}) ===", _dryRun);

        await using var oldDb = new SqlConnection(_oldConnStr);
        await oldDb.OpenAsync(ct);
        await using var newDb = new NpgsqlConnection(_newConnStr);
        await newDb.OpenAsync(ct);

        var oldRoles = (await oldDb.QueryAsync<OldRole>(@"
            SELECT Id, Name, Code, CreatedDate, CreatedBy, CreatedID,
                   UpdatedDate, UpdatedBy, UpdatedID
            FROM dbo.Role
            ORDER BY Id")).ToList();
        _log.LogInformation("Tổng Role cũ: {N}", oldRoles.Count);

        int inserted = 0, skipped = 0, errors = 0;

        foreach (var old in oldRoles)
        {
            try
            {
                var existing = await newDb.ExecuteScalarAsync<Guid?>(
                    @"SELECT new_id FROM _migration.role_id_map WHERE old_id=@id",
                    new { id = (long)old.Id });
                if (existing.HasValue) { skipped++; continue; }

                var newId = Guid.NewGuid();
                if (_dryRun) { inserted++; continue; }

                var createdId = await LookupUserAsync(newDb, old.CreatedID);
                var updatedId = await LookupUserAsync(newDb, old.UpdatedID);

                await using var tx = await newDb.BeginTransactionAsync(ct);
                await newDb.ExecuteAsync(@"
                    INSERT INTO public.""Role"" (
                        ""Id"", ""Name"", ""Code"", ""Type"", ""IsActive"", ""DepartmentId"",
                        ""CreatedDate"", ""CreatedBy"", ""CreatedId"",
                        ""UpdatedDate"", ""UpdatedBy"", ""UpdatedId"",
                        ""IsDeleted"", ""DeletedDate"", ""DeletedId""
                    ) VALUES (
                        @Id, @Name, @Code, NULL, TRUE, NULL,
                        @CreatedDate, @CreatedBy, @CreatedId,
                        @UpdatedDate, @UpdatedBy, @UpdatedId,
                        FALSE, NULL, NULL
                    )",
                    new
                    {
                        Id = newId,
                        old.Name,
                        old.Code,
                        CreatedDate = NormalizeDate(old.CreatedDate),
                        old.CreatedBy,
                        CreatedId = createdId,
                        UpdatedDate = NormalizeDate(old.UpdatedDate == default ? old.CreatedDate : old.UpdatedDate),
                        old.UpdatedBy,
                        UpdatedId = updatedId,
                    }, transaction: tx);

                await newDb.ExecuteAsync(@"
                    INSERT INTO _migration.role_id_map (old_id, new_id)
                    VALUES (@OldId, @NewId)",
                    new { OldId = (long)old.Id, NewId = newId }, transaction: tx);

                await tx.CommitAsync(ct);
                inserted++;
            }
            catch (Exception ex)
            {
                errors++;
                _log.LogError(ex, "Lỗi Role Id={OldId}", old.Id);
                if (!_dryRun) await LogErrorAsync(newDb, old.Id, ex.Message);
            }
        }

        progress?.Report(new MigrationProgress("Role", oldRoles.Count, oldRoles.Count, inserted, skipped, errors, "✅ Done"));
        _log.LogInformation("=== Role xong: inserted={I} skipped={S} errors={E} ===",
            inserted, skipped, errors);
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
                new { T = "Role", Id = oldId, Reason = reason });
        }
        catch { }
    }
}
