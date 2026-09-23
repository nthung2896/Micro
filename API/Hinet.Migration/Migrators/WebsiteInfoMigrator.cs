using System;
using System.Data;
using Dapper;
using Hinet.Migration.OldModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

// Migrate dbo.WebsiteInfo (SQL Server) → public."PlatformManage" (Postgres)
public class WebsiteInfoMigrator : IMigrator
{
    private readonly string _oldConnStr;
    private readonly string _newConnStr;
    private readonly int _batchSize;
    private readonly int? _limit;
    private readonly bool _dryRun;
    private readonly ILogger<WebsiteInfoMigrator> _log;

    public string Name => "WebsiteInfo";

    public WebsiteInfoMigrator(IConfiguration cfg, ILogger<WebsiteInfoMigrator> log)
    {
        _oldConnStr = cfg.GetConnectionString("OldSqlServer")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:OldSqlServer");
        _newConnStr = cfg.GetConnectionString("NewPostgres")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:NewPostgres");
        _batchSize = cfg.GetValue<int?>("Migration:BatchSize") ?? 500;
        _limit = cfg.GetValue<int?>("Migration:Limit");
        _dryRun = cfg.GetValue<bool?>("Migration:DryRun") ?? false;
        _log = log;
    }

    public async Task RunAsync(IProgress<MigrationProgress>? progress = null, CancellationToken ct = default)
    {
        _log.LogInformation("=== Bắt đầu migrate WebsiteInfo (DryRun={DryRun}, Batch={Batch}, Limit={Limit}) ===",
            _dryRun, _batchSize, _limit);

        await using var oldDb = new SqlConnection(_oldConnStr);
        await oldDb.OpenAsync(ct);

        await using var newDb = new NpgsqlConnection(_newConnStr);
        await newDb.OpenAsync(ct);

        // Đảm bảo bảng mapping có sẵn
        var companyMapCount = await newDb.ExecuteScalarAsync<long>(
            "SELECT COUNT(*) FROM _migration.company_id_map");
        if (companyMapCount == 0)
        {
            _log.LogWarning("company_id_map rỗng — có thể một số OrganizationId sẽ bị NULL. Hãy chắc chắn đã chạy CompanyInfoMigrator.");
        }

        var totalOld = await oldDb.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM dbo.WebsiteInfo");
        _log.LogInformation("Tổng dòng WebsiteInfo cũ: {Total}", totalOld);

        long lastId = 0;
        int processed = 0, inserted = 0, skipped = 0, errors = 0;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            var take = _limit.HasValue ? Math.Min(_batchSize, _limit.Value - processed) : _batchSize;
            if (take <= 0) break;

            var batch = (await oldDb.QueryAsync<OldWebsiteInfo>(@"
                SELECT TOP (@Take)
                    Id, Status, WebsiteTypeId, WebsiteManageTypeId, OrganizationId, TypeOrganization,
                    DepartmentId, CompanyTypeId, CompanyName, CompanyTaxCode, CompanyAddress,
                    CompanyPhone, CompanyFax, Name, Domain, Customer, MonitorMethod,
                    ProductType, ISPId, ISPIdKhac, StaffNumber, CommitApprove, Detail,
                    History, SubmitDate, SubmitName, SubmitSignature, ReviewDate,
                    ReviewName, ReviewSignature, ApproveDate, ApproveName, ApproveSignature,
                    RequestChangeDate, RequestChangeName, WebsiteNumber, Seal, flag,
                    Reason, Comment, Utility, DomainAdd, ImagePath, CCCD, StickId,
                    TinhId, HuyenId, XaId, QuocGiaId, SendStatus, IsDelete, DeleteById,
                    DeleteDate, EndDateNoti, TienIchKhac, LoaiHangHoaKhac, DateLine,
                    RepresenterName, RepresenterCCCD, RepresenterMobile, RepresenterJob,
                    RepresenterEmail, Address, PhuongThucLienHe, RepresenterNameOnline,
                    RepresenterJobOnline, RepresenterMobileOnline, RepresenterEmailOnline,
                    AddressOnline, PhuongThucLienHeOnline, RepresenterNameDaiDien,
                    RepresenterJobDaiDien, RepresenterMobileDaiDien, RepresenterEmailDaiDien,
                    AddressDaiDien, PhuongThucLienHeDaiDien, IsUuTienGuiBaoCao, ReviewDatHang,
                    UserReviewDatHang, API, URLWebsite, UserWebsite, PassWebsite, IsNuocNgoai,
                    SoCongVan, PhuongAnCungCapBaoCao, DataSignedTruongPhong, SignDateTruongPhong,
                    TruongPhongId, DataSignedLanhDao, SignDateLanhDao, LanhDaoId, DataSignedUser,
                    TinhIdNew, SignDateUser,
                    CreatedDate, CreatedBy, CreatedID,
                    UpdatedDate, UpdatedBy, UpdatedID
                FROM dbo.WebsiteInfo
                WHERE Id > @LastId
                ORDER BY Id",
                new { Take = take, LastId = lastId })).ToList();

            if (batch.Count == 0) break;

            foreach (var old in batch)
            {
                processed++;
                lastId = old.Id;

                try
                {
                    // === Idempotent check ===
                    var existingNewId = await newDb.ExecuteScalarAsync<Guid?>(
                        @"SELECT new_id FROM _migration.website_id_map WHERE old_id=@id",
                        new { id = old.Id });
                    if (existingNewId.HasValue)
                    {
                        skipped++;
                        continue;
                    }

                    var newId = Guid.NewGuid();

                    // === Lookup FKs ===
                    var createdId  = await LookupUserAsync(newDb, old.CreatedID);
                    var updatedId  = await LookupUserAsync(newDb, old.UpdatedID);
                    var deletedId  = await LookupUserAsync(newDb, old.DeleteById);
                    var reviewId   = await LookupUserAsync(newDb, old.UserReviewDatHang);
                    var orgId      = await LookupCompanyAsync(newDb, old.OrganizationId);

                    if (_dryRun)
                    {
                        inserted++;
                        continue;
                    }

                    // === INSERT vào PlatformManage ===
                    await using var tx = await newDb.BeginTransactionAsync(ct);
                    await newDb.ExecuteAsync(@"
                        INSERT INTO public.""PlatformManage"" (
                            ""Id"", ""Status"", ""AppManageTypeId"", ""OrganizationId"", ""TypeOrganization"",
                            ""OldSysId"", ""DateLine"", ""PlatformType"", ""AvailabilityType"",
                            ""CompanyName"", ""CompanyTaxCode"", ""CompanyAddress"", ""Address"",
                            ""CompanyPhone"", ""CompanyFax"", ""CompanyEmail"", ""StaffNumber"", ""IsNuocNgoai"",
                            ""Name"", ""Domain"", ""DomainAdd"", ""ISPId"", ""ISPIdKhac"",
                            ""Detail"", ""Seal"", ""ImagePath"", ""TienIchKhac"", ""LoaiHangHoaKhac"",
                            ""API"", ""URLApp"", ""UserApp"", ""PassApp"",
                            ""TinhId"", ""MaTinh"", ""HuyenId"", ""XaId"", ""QuocGiaId"",
                            ""SubmitDate"", ""SubmitName"", ""ReviewDate"", ""ReviewId"", ""ReviewName"",
                            ""RequestChangeDate"", ""RequestChangeName"", ""DataSignedUser"", ""SignDateUser"",
                            ""SoCongVan"", ""WebsiteNumber"",
                            ""RepresenterName"", ""RepresenterJob"", ""RepresenterMobile"", ""RepresenterEmail"",
                            ""RepresenterCCCD"", ""RepresenterDiaChi"",
                            ""RepresenterNameOnline"", ""RepresenterJobOnline"", ""RepresenterMobileOnline"",
                            ""RepresenterEmailOnline"", ""AddressOnline"", ""PhuongThucLienHeOnline"",
                            ""RepresenterNameDaiDien"", ""RepresenterJobDaiDien"", ""RepresenterMobileDaiDien"",
                            ""RepresenterEmailDaiDien"", ""AddressDaiDien"", ""PhuongThucLienHeDaiDien"",
                            ""PhuongThucLienHe"",
                            ""CreatedDate"", ""CreatedBy"", ""CreatedId"",
                            ""UpdatedDate"", ""UpdatedBy"", ""UpdatedId"",
                            ""IsDeleted"", ""DeletedDate"", ""DeletedId""
                        ) VALUES (
                            @Id, @Status, @AppManageTypeId, @OrganizationId, @TypeOrganization,
                            @OldSysId, @DateLine, @PlatformType, @AvailabilityType,
                            @CompanyName, @CompanyTaxCode, @CompanyAddress, @Address,
                            @CompanyPhone, @CompanyFax, @CompanyEmail, @StaffNumber, @IsNuocNgoai,
                            @Name, @Domain, @DomainAdd, @ISPId, @ISPIdKhac,
                            @Detail, @Seal, @ImagePath, @TienIchKhac, @LoaiHangHoaKhac,
                            @API, @URLApp, @UserApp, @PassApp,
                            @TinhId, @MaTinh, @HuyenId, @XaId, @QuocGiaId,
                            @SubmitDate, @SubmitName, @ReviewDate, @ReviewId, @ReviewName,
                            @RequestChangeDate, @RequestChangeName, @DataSignedUser, @SignDateUser,
                            @SoCongVan, @WebsiteNumber,
                            @RepresenterName, @RepresenterJob, @RepresenterMobile, @RepresenterEmail,
                            @RepresenterCCCD, @RepresenterDiaChi,
                            @RepresenterNameOnline, @RepresenterJobOnline, @RepresenterMobileOnline,
                            @RepresenterEmailOnline, @AddressOnline, @PhuongThucLienHeOnline,
                            @RepresenterNameDaiDien, @RepresenterJobDaiDien, @RepresenterMobileDaiDien,
                            @RepresenterEmailDaiDien, @AddressDaiDien, @PhuongThucLienHeDaiDien,
                            @PhuongThucLienHe,
                            @CreatedDate, @CreatedBy, @CreatedId,
                            @UpdatedDate, @UpdatedBy, @UpdatedId,
                            @IsDeleted, @DeletedDate, @DeletedId
                        )",
                        new
                        {
                            Id = newId,
                            old.Status,
                            AppManageTypeId = old.WebsiteManageTypeId switch
                            {
                                0 => 1,
                                1 => 3,
                                _ => old.WebsiteManageTypeId
                            },
                            OrganizationId = orgId,
                            TypeOrganization = Clean(old.TypeOrganization),
                            OldSysId = (long?)old.Id,
                            DateLine = NormalizeDate(old.DateLine),
                            PlatformType = (string?)null,
                            AvailabilityType = 1, // Chỉ có website
                            CompanyName = Clean(old.CompanyName),
                            CompanyTaxCode = Clean(old.CompanyTaxCode),
                            CompanyAddress = Clean(old.CompanyAddress),
                            Address = Clean(old.CompanyAddress), // Map CompanyAddress sang Address (trụ sở liên hệ)
                            CompanyPhone = Clean(old.CompanyPhone),
                            CompanyFax = Clean(old.CompanyFax),
                            CompanyEmail = (string?)null, // Email của website
                            StaffNumber = (int?)old.StaffNumber,
                            IsNuocNgoai = (bool?)old.IsNuocNgoai,
                            Name = Clean(old.Name),
                            Domain = Clean(old.Domain),
                            DomainAdd = Clean(old.DomainAdd),
                            ISPId = Clean(old.ISPId.ToString()),
                            ISPIdKhac = Clean(old.ISPIdKhac),
                            Detail = Clean(old.Detail),
                            Seal = Clean(old.Seal),
                            ImagePath = Clean(old.ImagePath),
                            TienIchKhac = Clean(old.TienIchKhac),
                            LoaiHangHoaKhac = Clean(old.LoaiHangHoaKhac),
                            API = old.API ? "Có" : "Không",
                            URLApp = Clean(old.URLWebsite),
                            UserApp = Clean(old.UserWebsite),
                            PassApp = Clean(old.PassWebsite),
                            TinhId = Clean(old.TinhIdNew ?? old.TinhId),
                            MaTinh = Clean(old.TinhIdNew ?? old.TinhId),
                            HuyenId = Clean(old.HuyenId),
                            XaId = Clean(old.XaId),
                            QuocGiaId = Clean(old.QuocGiaId) ?? "VN",
                            SubmitDate = NormalizeDate(old.SubmitDate),
                            SubmitName = Clean(old.SubmitName),
                            ReviewDate = NormalizeDate(old.ReviewDate),
                            ReviewId = reviewId,
                            ReviewName = Clean(old.ReviewName),
                            RequestChangeDate = NormalizeDate(old.RequestChangeDate),
                            RequestChangeName = Clean(old.RequestChangeName),
                            DataSignedUser = Clean(old.DataSignedUser),
                            SignDateUser = NormalizeDate(old.SignDateUser),
                            SoCongVan = Clean(old.SoCongVan),
                            WebsiteNumber = Clean(old.WebsiteNumber),
                            RepresenterName = Clean(old.RepresenterName),
                            RepresenterJob = Clean(old.RepresenterJob),
                            RepresenterMobile = Clean(old.RepresenterMobile),
                            RepresenterEmail = Clean(old.RepresenterEmail),
                            RepresenterCCCD = Clean(old.RepresenterCCCD),
                            RepresenterDiaChi = Clean(old.Address), // Địa chỉ người đại diện
                            RepresenterNameOnline = Clean(old.RepresenterNameOnline),
                            RepresenterJobOnline = Clean(old.RepresenterJobOnline),
                            RepresenterMobileOnline = Clean(old.RepresenterMobileOnline),
                            RepresenterEmailOnline = Clean(old.RepresenterEmailOnline),
                            AddressOnline = Clean(old.AddressOnline),
                            PhuongThucLienHeOnline = Clean(old.PhuongThucLienHeOnline),
                            RepresenterNameDaiDien = Clean(old.RepresenterNameDaiDien),
                            RepresenterJobDaiDien = Clean(old.RepresenterJobDaiDien),
                            RepresenterMobileDaiDien = Clean(old.RepresenterMobileDaiDien),
                            RepresenterEmailDaiDien = Clean(old.RepresenterEmailDaiDien),
                            AddressDaiDien = Clean(old.AddressDaiDien),
                            PhuongThucLienHeDaiDien = Clean(old.PhuongThucLienHeDaiDien),
                            PhuongThucLienHe = Clean(old.PhuongThucLienHe),
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
                        INSERT INTO _migration.website_id_map (old_id, new_id)
                        VALUES (@OldId, @NewId)",
                        new { OldId = old.Id, NewId = newId }, transaction: tx);

                    await tx.CommitAsync(ct);
                    inserted++;
                }
                catch (Exception ex)
                {
                    errors++;
                    _log.LogError(ex, "Lỗi migrate WebsiteInfo Id={OldId}", old.Id);
                    if (!_dryRun)
                    {
                        await LogErrorAsync(newDb, old.Id, ex.Message);
                    }
                }
            }

            _log.LogInformation(
                "Tiến độ: processed={Processed}/{Total} inserted={Inserted} skipped={Skipped} errors={Errors} lastId={LastId}",
                processed, totalOld, inserted, skipped, errors, lastId);

            progress?.Report(new MigrationProgress("WebsiteInfo", totalOld, processed, inserted, skipped, errors,
                $"lastId={lastId}"));
        }

        progress?.Report(new MigrationProgress("WebsiteInfo", totalOld, totalOld, inserted, skipped, errors, "✅ Done"));
        _log.LogInformation(
            "=== Hoàn tất WebsiteInfo: processed={Processed} inserted={Inserted} skipped={Skipped} errors={Errors} ===",
            processed, inserted, skipped, errors);
    }

    private static DateTime? NormalizeDate(DateTime? d)
    {
        if (!d.HasValue) return null;
        return d.Value < new DateTime(1900, 1, 1) ? DateTime.UtcNow : d.Value;
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

    private static async Task<Guid?> LookupCompanyAsync(IDbConnection newDb, long? oldCompanyId)
    {
        if (!oldCompanyId.HasValue) return null;
        return await newDb.ExecuteScalarAsync<Guid?>(
            @"SELECT new_id FROM _migration.company_id_map WHERE old_id=@id",
            new { id = oldCompanyId.Value });
    }

    private static async Task LogErrorAsync(IDbConnection newDb, long oldId, string reason)
    {
        try
        {
            await newDb.ExecuteAsync(@"
                INSERT INTO _migration.error_log (table_name, old_id, reason)
                VALUES (@T, @Id, @Reason)",
                new { T = "WebsiteInfo", Id = oldId, Reason = reason });
        }
        catch { }
    }
}
