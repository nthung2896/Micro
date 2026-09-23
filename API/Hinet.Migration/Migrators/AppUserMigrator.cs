using System.Data;
using Dapper;
using Hinet.Migration.OldModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

// Migrate dbo.AppUser (SQL Server) → public."AspNetUsers" (Postgres).
//
// 2-pass do self-FK (CreatedID/UpdatedID/DeleteId tự trỏ AppUser):
//   Pass 1: Insert toàn bộ user với CreatedId/UpdatedId/DeletedId = null
//           + ghi mapping vào _migration.user_id_map
//   Pass 2: UPDATE backfill self-FK từ user_id_map
//
// Đặc điểm:
//   - Idempotent: skip dòng đã có trong user_id_map
//   - Skip + log nếu UserName trùng (DB mới có unique index)
//   - Dry-run: chỉ đếm, không ghi
public class AppUserMigrator : IMigrator
{
    private readonly string _oldConnStr;
    private readonly string _newConnStr;
    private readonly int _batchSize;
    private readonly bool _dryRun;
    private readonly ILogger<AppUserMigrator> _log;

    public string Name => "AppUser";

    public AppUserMigrator(IConfiguration cfg, ILogger<AppUserMigrator> log)
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
        _log.LogInformation("=== Bắt đầu migrate AppUser (DryRun={DryRun}, Batch={Batch}) ===",
            _dryRun, _batchSize);

        await using var oldDb = new SqlConnection(_oldConnStr);
        await oldDb.OpenAsync(ct);
        await using var newDb = new NpgsqlConnection(_newConnStr);
        await newDb.OpenAsync(ct);

        var totalOld = await oldDb.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM dbo.AppUser");
        _log.LogInformation("Tổng dòng DB cũ: {Total}", totalOld);

        // ============== PASS 1: insert + map ==============
        long lastId = 0;
        int processed = 0, inserted = 0, skipped = 0, duplicateUserName = 0, errors = 0;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            var batch = (await oldDb.QueryAsync<OldAppUser>(@"
                SELECT TOP (@Take)
                    Id, UserName, Email, PhoneNumber, BirthDay, Gender, Address,
                    FullName, Avatar, TypeAccount, OrganizationId,
                    CreatedDate, CreatedBy, CreatedID, UpdatedDate, UpdatedBy, UpdatedID,
                    IsDelete, DeleteTime, DeleteId, GroupUser, IsLoginSSO,
                    EmailConfirmed, PasswordHash, SecurityStamp,
                    PhoneNumberConfirmed, TwoFactorEnabled,
                    LockoutEndDateUtc, LockoutEnabled, AccessFailedCount
                FROM dbo.AppUser
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
                    // Idempotent
                    var existing = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.user_id_map WHERE old_id=@id",
                        new { id = old.Id });
                    if (existing.HasValue) { skipped++; continue; }

                    if (string.IsNullOrWhiteSpace(old.UserName))
                    {
                        await LogErrorAsync(newDb, old.Id, "UserName null/empty");
                        errors++;
                        continue;
                    }

                    // Check trùng UserName (unique index ở DB mới)
                    var dup = await newDb.ExecuteScalarAsync<bool>(
                        @"SELECT EXISTS(SELECT 1 FROM public.""AspNetUsers"" WHERE ""UserName""=@u)",
                        new { u = old.UserName });
                    if (dup)
                    {
                        duplicateUserName++;
                        await LogErrorAsync(newDb, old.Id,
                            $"UserName '{old.UserName}' đã tồn tại ở DB mới — skip");
                        continue;
                    }

                    var newId = Guid.NewGuid();
                    if (_dryRun) { inserted++; continue; }

                    await using var tx = await newDb.BeginTransactionAsync(ct);
                    await newDb.ExecuteAsync(@"
                        INSERT INTO public.""AspNetUsers"" (
                            ""Id"", ""UserName"", ""NormalizedUserName"",
                            ""Email"", ""NormalizedEmail"", ""EmailConfirmed"",
                            ""PhoneNumber"", ""PhoneNumberConfirmed"",
                            ""Name"", ""Gender"", ""Picture"", ""Type"",
                            ""NgaySinh"", ""DiaChi"", ""IsSSO"", ""GroupRole"",
                            ""PasswordHash"", ""SecurityStamp"", ""ConcurrencyStamp"",
                            ""TwoFactorEnabled"",
                            ""LockoutEnd"", ""LockoutEnabled"", ""AccessFailedCount"",
                            ""CreatedDate"", ""CreatedBy"", ""CreatedId"",
                            ""UpdatedDate"", ""UpdatedBy"", ""UpdatedId"",
                            ""IsDeleted"", ""DeletedDate"", ""DeletedId""
                        ) VALUES (
                            @Id, @UserName, @NormalizedUserName,
                            @Email, @NormalizedEmail, @EmailConfirmed,
                            @PhoneNumber, @PhoneNumberConfirmed,
                            @Name, @Gender, @Picture, @Type,
                            @NgaySinh, @DiaChi, @IsSSO, @GroupRole,
                            @PasswordHash, @SecurityStamp, @ConcurrencyStamp,
                            @TwoFactorEnabled,
                            @LockoutEnd, @LockoutEnabled, @AccessFailedCount,
                            @CreatedDate, @CreatedBy, NULL,
                            @UpdatedDate, @UpdatedBy, NULL,
                            @IsDeleted, @DeletedDate, NULL
                        )",
                        new
                        {
                            Id = newId,
                            old.UserName,
                            NormalizedUserName = old.UserName.ToUpperInvariant(),
                            old.Email,
                            NormalizedEmail = old.Email?.ToUpperInvariant(),
                            old.EmailConfirmed,
                            old.PhoneNumber,
                            old.PhoneNumberConfirmed,
                            Name = old.FullName,
                            old.Gender,
                            Picture = old.Avatar,
                            Type = old.TypeAccount,
                            NgaySinh = old.BirthDay,
                            DiaChi = old.Address,
                            IsSSO = old.IsLoginSSO,
                            GroupRole = old.GroupUser,
                            old.PasswordHash,
                            old.SecurityStamp,
                            ConcurrencyStamp = Guid.NewGuid().ToString(),
                            old.TwoFactorEnabled,
                            LockoutEnd = ToUtc(old.LockoutEndDateUtc),
                            old.LockoutEnabled,
                            old.AccessFailedCount,
                            CreatedDate = NormalizeDate(old.CreatedDate ?? DateTime.UtcNow),
                            old.CreatedBy,
                            UpdatedDate = NormalizeDate(old.UpdatedDate ?? old.CreatedDate ?? DateTime.UtcNow),
                            old.UpdatedBy,
                            IsDeleted = old.IsDelete ?? false,
                            DeletedDate = old.DeleteTime,
                        }, transaction: tx);

                    await newDb.ExecuteAsync(@"
                        INSERT INTO _migration.user_id_map (old_id, new_id)
                        VALUES (@OldId, @NewId)",
                        new { OldId = old.Id, NewId = newId }, transaction: tx);

                    await tx.CommitAsync(ct);
                    inserted++;
                }
                catch (Exception ex)
                {
                    errors++;
                    _log.LogError(ex, "Lỗi migrate AppUser Id={OldId}", old.Id);
                    if (!_dryRun) await LogErrorAsync(newDb, old.Id, ex.Message);
                }
            }

            _log.LogInformation(
                "Pass1: processed={Processed}/{Total} inserted={Inserted} skipped={Skipped} dup={Dup} errors={Errors} lastId={LastId}",
                processed, totalOld, inserted, skipped, duplicateUserName, errors, lastId);

            progress?.Report(new MigrationProgress("AppUser", totalOld, processed, inserted, skipped, errors,
                $"dup={duplicateUserName} lastId={lastId}"));
        }

        _log.LogInformation(
            "=== Pass 1 xong: inserted={Inserted} skipped={Skipped} dup={Dup} errors={Errors} ===",
            inserted, skipped, duplicateUserName, errors);
        progress?.Report(new MigrationProgress("AppUser", totalOld, totalOld, inserted, skipped, errors, "✅ Pass 1 done"));

        if (_dryRun)
        {
            _log.LogInformation("Dry-run → bỏ qua Pass 2 (backfill self-FK).");
            return;
        }

        // ============== PASS 2: backfill self-FK ==============
        _log.LogInformation("=== Pass 2: backfill CreatedId/UpdatedId/DeletedId từ user_id_map ===");

        // Tạo bảng tạm chứa mapping CreatedID/UpdatedID/DeleteId từ DB cũ để
        // 1 query UPDATE giải quyết hết — tránh round-trip per row.
        await newDb.ExecuteAsync(@"
            CREATE TABLE IF NOT EXISTS _migration.user_self_ref_temp (
                new_id     uuid PRIMARY KEY,
                created_id uuid,
                updated_id uuid,
                deleted_id uuid
            );
            TRUNCATE _migration.user_self_ref_temp;");

        // Đọc từ DB cũ: (Id_cũ, CreatedID, UpdatedID, DeleteId)
        var refs = await oldDb.QueryAsync<(long Id, long? CreatedId, long? UpdatedId, long? DeletedId)>(@"
            SELECT Id, CreatedID, UpdatedID, DeleteId
            FROM dbo.AppUser
            WHERE CreatedID IS NOT NULL OR UpdatedID IS NOT NULL OR DeleteId IS NOT NULL");

        var refList = refs.ToList();
        _log.LogInformation("Có {N} user cần backfill self-FK", refList.Count);

        int backfilled = 0;
        foreach (var batch in refList.Chunk(_batchSize))
        {
            await using var tx = await newDb.BeginTransactionAsync(ct);
            foreach (var r in batch)
            {
                var newId = await newDb.ExecuteScalarAsync<Guid?>(
                    @"SELECT new_id FROM _migration.user_id_map WHERE old_id=@id",
                    new { id = r.Id }, transaction: tx);
                if (!newId.HasValue) continue;

                var createdNew = r.CreatedId.HasValue
                    ? await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.user_id_map WHERE old_id=@id",
                        new { id = r.CreatedId.Value }, transaction: tx)
                    : null;
                var updatedNew = r.UpdatedId.HasValue
                    ? await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.user_id_map WHERE old_id=@id",
                        new { id = r.UpdatedId.Value }, transaction: tx)
                    : null;
                var deletedNew = r.DeletedId.HasValue
                    ? await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.user_id_map WHERE old_id=@id",
                        new { id = r.DeletedId.Value }, transaction: tx)
                    : null;

                await newDb.ExecuteAsync(@"
                    INSERT INTO _migration.user_self_ref_temp (new_id, created_id, updated_id, deleted_id)
                    VALUES (@NewId, @CreatedNew, @UpdatedNew, @DeletedNew)
                    ON CONFLICT (new_id) DO NOTHING",
                    new { NewId = newId.Value, CreatedNew = createdNew, UpdatedNew = updatedNew, DeletedNew = deletedNew },
                    transaction: tx);
            }
            await tx.CommitAsync(ct);
            backfilled += batch.Length;
            _log.LogInformation("Backfill prep: {N}/{T}", backfilled, refList.Count);
        }

        // 1 UPDATE join — nhanh
        var affected = await newDb.ExecuteAsync(@"
            UPDATE public.""AspNetUsers"" u
            SET ""CreatedId"" = t.created_id,
                ""UpdatedId"" = t.updated_id,
                ""DeletedId"" = t.deleted_id
            FROM _migration.user_self_ref_temp t
            WHERE u.""Id"" = t.new_id;");

        _log.LogInformation("=== Pass 2 xong: UPDATE affected={Affected} ===", affected);
    }

    private static DateTime NormalizeDate(DateTime d) =>
        d < new DateTime(1900, 1, 1) ? DateTime.UtcNow : d;

    private static DateTime? ToUtc(DateTime? d) =>
        d.HasValue ? DateTime.SpecifyKind(d.Value, DateTimeKind.Utc) : null;

    private static async Task LogErrorAsync(IDbConnection newDb, long oldId, string reason)
    {
        try
        {
            await newDb.ExecuteAsync(@"
                INSERT INTO _migration.error_log (table_name, old_id, reason)
                VALUES (@T, @Id, @Reason)",
                new { T = "AppUser", Id = oldId, Reason = reason });
        }
        catch { }
    }
}
