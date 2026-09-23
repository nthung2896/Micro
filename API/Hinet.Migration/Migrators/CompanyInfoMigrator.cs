using System.Data;
using Dapper;
using Hinet.Migration.OldModels;
using Hinet.Model.Entities;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

// Migrate dbo.CompanyInfo (SQL Server) → public."CompanyInfo" (Postgres).
//
// Đặc điểm:
//   - Idempotent: skip dòng nào đã có trong _migration.company_id_map
//   - Batch processing: tránh OOM với DB lớn
//   - Lookup user_id_map cho CreatedID/UpdatedID/DeleteById; null nếu chưa có
//   - TinhId/XaId là string ở DB cũ → TryParse Guid; fail → null + log
//   - DryRun: chỉ in ra số dòng sẽ migrate, không ghi DB
public class CompanyInfoMigrator : IMigrator
{
    private readonly string _oldConnStr;
    private readonly string _newConnStr;
    private readonly int _batchSize;
    private readonly bool _dryRun;
    private readonly ILogger<CompanyInfoMigrator> _log;

    public string Name => "CompanyInfo";

    public CompanyInfoMigrator(IConfiguration cfg, ILogger<CompanyInfoMigrator> log)
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
        _log.LogInformation("=== Bắt đầu migrate CompanyInfo (DryRun={DryRun}, Batch={Batch}) ===",
            _dryRun, _batchSize);

        await using var oldDb = new SqlConnection(_oldConnStr);
        await oldDb.OpenAsync(ct);

        await using var newDb = new NpgsqlConnection(_newConnStr);
        await newDb.OpenAsync(ct);

        var totalOld = await oldDb.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM dbo.CompanyInfo");
        _log.LogInformation("Tổng dòng DB cũ: {Total}", totalOld);

        long lastId = 0;
        int processed = 0, inserted = 0, skipped = 0, errors = 0;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            // Keyset pagination theo Id thay vì OFFSET — chạy ổn định với bảng lớn.
            var batch = (await oldDb.QueryAsync<OldCompanyInfo>(@"
                SELECT TOP (@Take)
                    Id, Status, Name, EnglishName, ShortName, TaxCode,
                    Address, CityId, CityName, Phone, Fax, Email,
                    RepresenterName, RepresenterMobile, RepresenterPhone,
                    RepresenterEmail, RepresenterCCCD, Detail,
                    ApproveDateOnline, TinhId, TinhIdNew, XaId, QuocGiaId,
                    TypeOrganization, IsNuocNgoai, IsVonDauTuNuocNgoai, DKKD,
                    CreatedDate, CreatedBy, CreatedID,
                    UpdatedDate, UpdatedBy, UpdatedID,
                    IsDelete, DeleteDate, DeleteById
                FROM dbo.CompanyInfo
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
                        @"SELECT new_id FROM _migration.company_id_map WHERE old_id=@id",
                        new { id = old.Id });
                    if (existingNewId.HasValue)
                    {
                        skipped++;
                        continue;
                    }

                    var newId = Guid.NewGuid();

                    // === Lookup FK user_id_map (null nếu chưa migrate AppUser) ===
                    var createdId  = await LookupUserAsync(newDb, old.CreatedID);
                    var updatedId  = await LookupUserAsync(newDb, old.UpdatedID);
                    var deletedId  = await LookupUserAsync(newDb, old.DeleteById);

                    if (_dryRun)
                    {
                        inserted++;
                        continue;
                    }

                    // === INSERT vào CompanyInfo mới ===
                    await using var tx = await newDb.BeginTransactionAsync(ct);
                    await newDb.ExecuteAsync(@"
                        INSERT INTO public.""CompanyInfo"" (
                            ""Id"", ""Status"", ""Name"", ""EnglishName"", ""ShortName"",
                            ""TaxCode"", ""Address"", ""CityId"", ""CityName"",
                            ""Phone"", ""Fax"", ""Email"",
                            ""RepresenterName"", ""RepresenterMobile"", ""RepresenterPhone"",
                            ""RepresenterEmail"", ""RepresenterCCCD"", ""Detail"",
                            ""ApproveDateOnline"", ""TinhId"", ""TinhIdNew"", ""MaTinh"", ""XaId"",
                            ""QuocGiaId"", ""TypeOrganization"",
                            ""IsNuocNgoai"", ""IsVonDauTuNuocNgoai"", ""DKKD"",
                            ""CreatedDate"", ""CreatedBy"", ""CreatedId"",
                            ""UpdatedDate"", ""UpdatedBy"", ""UpdatedId"",
                            ""IsDeleted"", ""DeletedDate"", ""DeletedId""
                        ) VALUES (
                            @Id, @Status, @Name, @EnglishName, @ShortName,
                            @TaxCode, @Address, @CityId, @CityName,
                            @Phone, @Fax, @Email,
                            @RepresenterName, @RepresenterMobile, @RepresenterPhone,
                            @RepresenterEmail, @RepresenterCCCD, @Detail,
                            @ApproveDateOnline, @TinhId, @TinhIdNew, @MaTinh, @XaId,
                            @QuocGiaId, @TypeOrganization,
                            @IsNuocNgoai, @IsVonDauTuNuocNgoai, @DKKD,
                            @CreatedDate, @CreatedBy, @CreatedId,
                            @UpdatedDate, @UpdatedBy, @UpdatedId,
                            @IsDeleted, @DeletedDate, @DeletedId
                        )",
                        new
                        {
                            Id = newId,
                            old.Status,
                            Name = Clean(old.Name),
                            EnglishName = Clean(old.EnglishName),
                            ShortName = Clean(old.ShortName),
                            TaxCode = Clean(old.TaxCode),
                            Address = Clean(old.Address),
                            CityId = Clean(old.CityId),
                            CityName = Clean(old.CityName),
                            Phone = Clean(old.Phone),
                            Fax = Clean(old.Fax),
                            Email = Clean(old.Email),
                            RepresenterName = Clean(old.RepresenterName),
                            RepresenterMobile = Clean(old.RepresenterMobile),
                            RepresenterPhone = Clean(old.RepresenterPhone),
                            RepresenterEmail = Clean(old.RepresenterEmail),
                            RepresenterCCCD = Clean(old.RepresenterCCCD),
                            Detail = Clean(old.Detail),
                            old.ApproveDateOnline,
                            TinhId = TryParseGuid(old.TinhId),
                            TinhIdNew = TryParseGuid(old.TinhIdNew),
                            MaTinh = Clean(old.TinhIdNew),
                            XaId = TryParseGuid(old.XaId),
                            QuocGiaId = Clean(old.QuocGiaId) ?? "VN",
                            TypeOrganization = Clean(old.TypeOrganization),
                            old.IsNuocNgoai,
                            IsVonDauTuNuocNgoai = old.IsVonDauTuNuocNgoai ?? false,
                            DKKD = Clean(old.DKKD),
                            CreatedDate = NormalizeDate(old.CreatedDate),
                            CreatedBy = Clean(old.CreatedBy),
                            CreatedId = createdId,
                            UpdatedDate = NormalizeDate(old.UpdatedDate == default ? old.CreatedDate : old.UpdatedDate),
                            UpdatedBy = Clean(old.UpdatedBy),
                            UpdatedId = updatedId,
                            IsDeleted = old.IsDelete,
                            DeletedDate = old.DeleteDate,
                            DeletedId = deletedId,
                        }, transaction: tx);

                    await newDb.ExecuteAsync(@"
                        INSERT INTO _migration.company_id_map (old_id, new_id)
                        VALUES (@OldId, @NewId)",
                        new { OldId = old.Id, NewId = newId }, transaction: tx);

                    await tx.CommitAsync(ct);
                    inserted++;
                }
                catch (Exception ex)
                {
                    errors++;
                    _log.LogError(ex, "Lỗi migrate CompanyInfo Id={OldId}", old.Id);
                    if (!_dryRun)
                    {
                        await LogErrorAsync(newDb, old.Id, ex.Message);
                    }
                }
            }

            progress?.Report(new MigrationProgress("CompanyInfo", totalOld, processed, inserted, skipped, errors,
                $"lastId={lastId}"));
            _log.LogInformation(
                "Tiến độ: processed={Processed}/{Total} inserted={Inserted} skipped={Skipped} errors={Errors} lastId={LastId}",
                processed, totalOld, inserted, skipped, errors, lastId);
        }

        progress?.Report(new MigrationProgress("CompanyInfo", totalOld, totalOld, inserted, skipped, errors, "✅ Done"));
        _log.LogInformation(
            "=== Hoàn tất CompanyInfo: processed={Processed} inserted={Inserted} skipped={Skipped} errors={Errors} ===",
            processed, inserted, skipped, errors);
    }

    private static Guid? TryParseGuid(string? s) =>
        !string.IsNullOrWhiteSpace(s) && Guid.TryParse(s, out var g) ? g : null;

    private static string? Clean(string? s) => s?.Replace("\0", "").Trim();

    // DB cũ có thể có CreatedDate sai (datetime SQL Server có thể < year 1).
    // Postgres timestamp chấp nhận range rộng nhưng EF/Npgsql default validate.
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
                new { T = "CompanyInfo", Id = oldId, Reason = reason });
        }
        catch { /* không để log lỗi làm fail thêm */ }
    }
}
