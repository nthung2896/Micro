using System.Data;
using Dapper;
using Hinet.Migration.OldModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

// Migrate dbo.UserRole (bigint Id, UserId bigint, RoleId int) →
// public."UserRole" (uuid Id, UserId uuid, RoleId uuid).
//
// Prerequisites: AppUser + Role đã migrate xong (cần user_id_map + role_id_map).
// Bỏ qua bảng dbo.AppUserRole (Identity junction, không dùng ở DB mới).
public class UserRoleMigrator : IMigrator
{
    private readonly string _oldConnStr;
    private readonly string _newConnStr;
    private readonly int _batchSize;
    private readonly bool _dryRun;
    private readonly ILogger<UserRoleMigrator> _log;

    public string Name => "UserRole";

    public UserRoleMigrator(IConfiguration cfg, ILogger<UserRoleMigrator> log)
    {
        _oldConnStr = cfg.GetConnectionString("OldSqlServer")!;
        _newConnStr = cfg.GetConnectionString("NewPostgres")!;
        _batchSize = cfg.GetValue<int?>("Migration:BatchSize") ?? 500;
        _dryRun = cfg.GetValue<bool?>("Migration:DryRun") ?? false;
        _log = log;
    }

    public async Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default)
    {
        _log.LogInformation("=== Migrate UserRole (DryRun={DryRun}) ===", _dryRun);

        await using var oldDb = new SqlConnection(_oldConnStr);
        await oldDb.OpenAsync(ct);
        await using var newDb = new NpgsqlConnection(_newConnStr);
        await newDb.OpenAsync(ct);

        // Đảm bảo prerequisites đã có
        var userMapCount = await newDb.ExecuteScalarAsync<long>(
            "SELECT COUNT(*) FROM _migration.user_id_map");
        var roleMapCount = await newDb.ExecuteScalarAsync<long>(
            "SELECT COUNT(*) FROM _migration.role_id_map");
        if (userMapCount == 0 || roleMapCount == 0)
        {
            _log.LogError("Thiếu user_id_map ({U}) hoặc role_id_map ({R}). Migrate AppUser + Role trước.",
                userMapCount, roleMapCount);
            return;
        }

        var total = await oldDb.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM dbo.UserRole");
        _log.LogInformation("Tổng UserRole cũ: {N}", total);

        long lastId = 0;
        int processed = 0, inserted = 0, skipped = 0, missingFk = 0, dup = 0, errors = 0;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            var batch = (await oldDb.QueryAsync<OldUserRole>(@"
                SELECT TOP (@Take) Id, UserId, RoleId,
                    CreatedDate, CreatedBy, CreatedID,
                    UpdatedDate, UpdatedBy, UpdatedID
                FROM dbo.UserRole
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
                    // Lookup FK
                    var userNewId = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.user_id_map WHERE old_id=@id",
                        new { id = old.UserId });
                    var roleNewId = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.role_id_map WHERE old_id=@id",
                        new { id = (long)old.RoleId });

                    if (!userNewId.HasValue || !roleNewId.HasValue)
                    {
                        missingFk++;
                        await LogErrorAsync(newDb, old.Id,
                            $"Missing FK: UserId={old.UserId} (mapped={userNewId.HasValue}), RoleId={old.RoleId} (mapped={roleNewId.HasValue})");
                        continue;
                    }

                    // Idempotent: skip nếu cặp (UserId,RoleId) đã có
                    var dupExists = await newDb.ExecuteScalarAsync<bool>(@"
                        SELECT EXISTS(SELECT 1 FROM public.""UserRole""
                                      WHERE ""UserId""=@u AND ""RoleId""=@r)",
                        new { u = userNewId.Value, r = roleNewId.Value });
                    if (dupExists) { dup++; continue; }

                    if (_dryRun) { inserted++; continue; }

                    var createdId = await LookupUserAsync(newDb, old.CreatedID);
                    var updatedId = await LookupUserAsync(newDb, old.UpdatedID);

                    await newDb.ExecuteAsync(@"
                        INSERT INTO public.""UserRole"" (
                            ""Id"", ""UserId"", ""RoleId"", ""DepartmentId"", ""KhoiCode"",
                            ""CreatedDate"", ""CreatedBy"", ""CreatedId"",
                            ""UpdatedDate"", ""UpdatedBy"", ""UpdatedId"",
                            ""IsDeleted"", ""DeletedDate"", ""DeletedId""
                        ) VALUES (
                            @Id, @UserId, @RoleId, @DepartmentId, NULL,
                            @CreatedDate, @CreatedBy, @CreatedId,
                            @UpdatedDate, @UpdatedBy, @UpdatedId,
                            FALSE, NULL, NULL
                        )",
                        new
                        {
                            Id = Guid.NewGuid(),
                            UserId = userNewId.Value,
                            RoleId = roleNewId.Value,
                            DepartmentId = Guid.Empty,
                            CreatedDate = NormalizeDate(old.CreatedDate),
                            old.CreatedBy,
                            CreatedId = createdId,
                            UpdatedDate = NormalizeDate(old.UpdatedDate == default ? old.CreatedDate : old.UpdatedDate),
                            old.UpdatedBy,
                            UpdatedId = updatedId,
                        });

                    inserted++;
                }
                catch (Exception ex)
                {
                    errors++;
                    _log.LogError(ex, "Lỗi UserRole Id={OldId}", old.Id);
                    if (!_dryRun) await LogErrorAsync(newDb, old.Id, ex.Message);
                }
            }

            _log.LogInformation(
                "Progress: {P}/{T} inserted={I} dup={D} missingFk={M} errors={E} lastId={L}",
                processed, total, inserted, dup, missingFk, errors, lastId);

            progress?.Report(new MigrationProgress("UserRole", total, processed, inserted, skipped, errors,
                $"dup={dup} missingFk={missingFk} lastId={lastId}"));
        }

        progress?.Report(new MigrationProgress("UserRole", total, total, inserted, skipped, errors, "✅ Done"));
        _log.LogInformation(
            "=== UserRole xong: inserted={I} skipped={S} dup={D} missingFk={M} errors={E} ===",
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
                new { T = "UserRole", Id = oldId, Reason = reason });
        }
        catch { }
    }
}
