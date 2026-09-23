using System;
using System.Data;
using Dapper;
using Hinet.Migration.OldModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hinet.Migration.Migrators;

// Migrate dbo.AuthenticationContract (SQL Server) → public."AuthenticationContract" (Postgres)
//
// Lưu ý về mapping (do schema 2 bên KHÔNG khớp 1-1):
//   - Bảng mới chỉ giữ 1 bộ "người đại diện" là bộ *Online* (người quản lý vận hành)
//     + trường RepresenterJob riêng. Bảng cũ chỉ có 1 bộ Representer (Name/Job/Mobile/Email).
//     => Bộ Representer cũ được map vào bộ *Online* mới.
//   - Các cột NOT NULL (text) ở bảng mới mà bảng cũ không có nguồn → fill "" để không vỡ ràng buộc.
//   - ISPId mới là uuid nhưng cũ là int, không có bảng map ISP → dùng Guid.Empty.
//   - OrganizationId lookup qua company_id_map; nếu không có → Guid.Empty (cột NOT NULL).
public class AuthenticationContractMigrator : IMigrator
{
    private readonly string _oldConnStr;
    private readonly string _newConnStr;
    private readonly int _batchSize;
    private readonly bool _dryRun;
    private readonly ILogger<AuthenticationContractMigrator> _log;

    public string Name => "AuthenticationContract";

    public AuthenticationContractMigrator(IConfiguration cfg, ILogger<AuthenticationContractMigrator> log)
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
        _log.LogInformation("=== Bắt đầu migrate AuthenticationContract (DryRun={DryRun}, Batch={Batch}) ===",
            _dryRun, _batchSize);

        await using var oldDb = new SqlConnection(_oldConnStr);
        await oldDb.OpenAsync(ct);

        await using var newDb = new NpgsqlConnection(_newConnStr);
        await newDb.OpenAsync(ct);

        var companyMapCount = await newDb.ExecuteScalarAsync<long>(
            "SELECT COUNT(*) FROM _migration.company_id_map");
        if (companyMapCount == 0)
        {
            _log.LogWarning("company_id_map rỗng — OrganizationId sẽ bị đặt về Guid.Empty. Hãy chắc chắn đã chạy CompanyInfoMigrator.");
        }

        var totalOld = await oldDb.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM dbo.AuthenticationContract");
        _log.LogInformation("Tổng dòng AuthenticationContract cũ: {Total}", totalOld);

        long lastId = 0;
        int processed = 0, inserted = 0, skipped = 0, errors = 0;

        while (true)
        {
            ct.ThrowIfCancellationRequested();

            var batch = (await oldDb.QueryAsync<OldAuthenticationContract>(@"
                SELECT TOP (@Take)
                    Id, Status, OrganizationId, TypeOrganization,
                    CompanyName, CompanyTaxCode, CompanyAddress, CompanyPhone, CompanyFax,
                    Domain, ISPId, StaffNumber, DiaChiTruSo, DienThoai, fax, email,
                    RepresenterName, RepresenterMobile, RepresenterJob, RepresenterEmail,
                    Detail, Reason, Comment, ImagePath, ServicePostKhac,
                    WebsiteNumber, Seal, IsNuocNgoai, OldSysId,
                    IsDelete, DeleteById, DeleteDate,
                    CreatedDate, CreatedBy, CreatedID,
                    UpdatedDate, UpdatedBy, UpdatedID
                FROM dbo.AuthenticationContract
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
                        @"SELECT new_id FROM _migration.authcontract_id_map WHERE old_id=@id",
                        new { id = old.Id });
                    if (existingNewId.HasValue)
                    {
                        skipped++;
                        continue;
                    }

                    var newId = Guid.NewGuid();

                    // === Lookup FKs ===
                    var createdId = await LookupUserAsync(newDb, old.CreatedID);
                    var updatedId = await LookupUserAsync(newDb, old.UpdatedID);
                    var deletedId = await LookupUserAsync(newDb, old.DeleteById);
                    var orgId = await LookupCompanyAsync(newDb, old.OrganizationId) ?? Guid.Empty;
                    var (ispId, ispKhac) = ResolveIsp(old.ISPId, _log, old.Id);

                    if (_dryRun)
                    {
                        inserted++;
                        continue;
                    }

                    // === INSERT vào AuthenticationContract ===
                    await using var tx = await newDb.BeginTransactionAsync(ct);
                    await newDb.ExecuteAsync(@"
                        INSERT INTO public.""AuthenticationContract"" (
                            ""Id"", ""Status"", ""OrganizationId"", ""TypeOrganization"",
                            ""CompanyTaxCode"", ""ChuSoHuu"", ""Logo"",
                            ""Name"", ""Domain"", ""DomainAdd"", ""ISPId"", ""ISPidKhac"",
                            ""LinhVucCungCapKhac"", ""NgonNgu"", ""StaffNumber"",
                            ""RepresenterJob"",
                            ""RepresenterNameOnline"", ""RepresenterJobOnline"", ""RepresenterCCCDOnline"",
                            ""RepresenterDiaChiOnline"", ""RepresenterMobileOnline"", ""RepresenterEmailOnline"",
                            ""LyDoDeNghiCapNhat"", ""Note"", ""ChuyenVienXuLyId"",
                            ""DvcMaHoSo"", ""DvcIdHoSo"", ""DvcSyncStatus"", ""DvcSyncDate"",
                            ""DvcRetryCount"", ""DvcErrorMessage"",
                            ""CreatedDate"", ""CreatedBy"", ""CreatedId"",
                            ""UpdatedDate"", ""UpdatedBy"", ""UpdatedId"",
                            ""IsDeleted"", ""DeletedDate"", ""DeletedId""
                        ) VALUES (
                            @Id, @Status, @OrganizationId, @TypeOrganization,
                            @CompanyTaxCode, @ChuSoHuu, @Logo,
                            @Name, @Domain, @DomainAdd, @ISPId, @ISPidKhac,
                            @LinhVucCungCapKhac, @NgonNgu, @StaffNumber,
                            @RepresenterJob,
                            @RepresenterNameOnline, @RepresenterJobOnline, @RepresenterCCCDOnline,
                            @RepresenterDiaChiOnline, @RepresenterMobileOnline, @RepresenterEmailOnline,
                            @LyDoDeNghiCapNhat, @Note, @ChuyenVienXuLyId,
                            @DvcMaHoSo, @DvcIdHoSo, @DvcSyncStatus, @DvcSyncDate,
                            @DvcRetryCount, @DvcErrorMessage,
                            @CreatedDate, @CreatedBy, @CreatedId,
                            @UpdatedDate, @UpdatedBy, @UpdatedId,
                            @IsDeleted, @DeletedDate, @DeletedId
                        )",
                        new
                        {
                            Id = newId,
                            old.Status,
                            OrganizationId = orgId,
                            TypeOrganization = Clean(old.TypeOrganization) ?? "",

                            CompanyTaxCode = Clean(old.CompanyTaxCode) ?? "",
                            ChuSoHuu = Clean(old.CompanyName) ?? "",           // chủ sở hữu nền tảng = DN chủ quản
                            Logo = Clean(old.ImagePath) ?? "",

                            Name = Clean(old.Domain) ?? "",                    // bảng cũ không có tên nền tảng → dùng Domain
                            Domain = Clean(old.Domain) ?? "",
                            DomainAdd = "",                                    // bảng cũ không có
                            ISPId = ispId,                                     // map từ mã hosting cũ (int) sang Guid danh mục DVCCHOSTING
                            ISPidKhac = ispKhac,                               // giữ tên NCC gốc nếu mã cũ không có trong danh mục mới
                            LinhVucCungCapKhac = Clean(old.ServicePostKhac),
                            NgonNgu = "",                                      // bảng cũ không có
                            StaffNumber = old.StaffNumber,

                            RepresenterJob = Clean(old.RepresenterJob) ?? "",

                            // Bộ người đại diện cũ → map vào bộ Online mới
                            RepresenterNameOnline = Clean(old.RepresenterName) ?? "",
                            RepresenterJobOnline = Clean(old.RepresenterJob) ?? "",
                            RepresenterCCCDOnline = "",                        // bảng cũ không có
                            RepresenterDiaChiOnline = Clean(old.DiaChiTruSo) ?? "",
                            RepresenterMobileOnline = Clean(old.RepresenterMobile) ?? "",
                            RepresenterEmailOnline = Clean(old.RepresenterEmail) ?? "",

                            LyDoDeNghiCapNhat = Clean(old.Reason),
                            Note = Clean(old.Comment),
                            ChuyenVienXuLyId = (Guid?)null,

                            // DVC sync: hồ sơ cũ chưa từng đồng bộ
                            DvcMaHoSo = (string?)null,
                            DvcIdHoSo = (string?)null,
                            DvcSyncStatus = 0,
                            DvcSyncDate = (DateTime?)null,
                            DvcRetryCount = 0,
                            DvcErrorMessage = (string?)null,

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
                        INSERT INTO _migration.authcontract_id_map (old_id, new_id)
                        VALUES (@OldId, @NewId)",
                        new { OldId = old.Id, NewId = newId }, transaction: tx);

                    await tx.CommitAsync(ct);
                    inserted++;
                }
                catch (Exception ex)
                {
                    errors++;
                    _log.LogError(ex, "Lỗi migrate AuthenticationContract Id={OldId}", old.Id);
                    if (!_dryRun)
                    {
                        await LogErrorAsync(newDb, old.Id, ex.Message);
                    }
                }
            }

            _log.LogInformation(
                "Tiến độ: processed={Processed}/{Total} inserted={Inserted} skipped={Skipped} errors={Errors} lastId={LastId}",
                processed, totalOld, inserted, skipped, errors, lastId);

            progress?.Report(new MigrationProgress("AuthenticationContract", totalOld, processed, inserted, skipped, errors,
                $"lastId={lastId}"));
        }

        progress?.Report(new MigrationProgress("AuthenticationContract", totalOld, totalOld, inserted, skipped, errors, "✅ Done"));
        _log.LogInformation(
            "=== Hoàn tất AuthenticationContract: processed={Processed} inserted={Inserted} skipped={Skipped} errors={Errors} ===",
            processed, inserted, skipped, errors);
    }

    // =====================================================================
    // Map ISPId (đơn vị hosting): mã danh mục int (hệ cũ) → Guid (danh mục DVCCHOSTING hệ mới)
    // =====================================================================

    private static readonly Guid KhacIspId = Guid.Parse("3e6a3fdd-096c-4c83-a2a5-c91e8a0abc7a"); // "Khác"

    // 20 mã cũ khớp trực tiếp với item trong danh mục DVCCHOSTING mới (đối chiếu theo Tên).
    private static readonly Dictionary<int, Guid> IspCodeToGuid = new()
    {
        [1]  = Guid.Parse("d5a809ae-260f-43a4-ac33-154c1e9f0a85"), // FPT
        [2]  = Guid.Parse("1572dbfd-620e-497e-bbc1-d6520da0cd89"), // ViettelIDC → Viettel IDC
        [4]  = Guid.Parse("c4b64ac4-ae9a-452d-aa4e-0cad67681b42"), // PAVietnam → PAVietNam
        [5]  = Guid.Parse("5fdb7c43-c95b-4336-a827-cdc891fb6a7b"), // Mắt bão
        [6]  = Guid.Parse("f080b9cf-571d-4561-9e36-39b294abdaa0"), // Nhân Hòa → Nhân hoà
        [8]  = Guid.Parse("2ad3421e-27d5-407e-9fc4-53d329b4c9c7"), // HostVN.net
        [11] = Guid.Parse("f76f0318-d3b8-4726-98ea-764b3ea064ca"), // Business.vn → Bussiness.vn
        [13] = Guid.Parse("933061ea-ec1a-4927-a8da-5d0b4e22e8be"), // VNPT Data → VNPT
        [14] = Guid.Parse("18ef4feb-1b0f-480b-b75f-44702292378b"), // BeeHost
        [16] = Guid.Parse("ae5b142c-806c-4447-a351-84d54f0cc152"), // BKNS
        [17] = KhacIspId,                                          // Khác
        [18] = Guid.Parse("c95e6627-0df9-4638-9bac-f053a6cf9bd6"), // Hosting tại doanh nghiệp
        [19] = Guid.Parse("4e2cc29b-0e26-4de3-a51c-478c3a072972"), // Hosting nước ngoài
        [20] = Guid.Parse("4ed70ac3-760a-4894-b2c3-0d3bd39ed8ee"), // Netnam → NetNam
        [24] = Guid.Parse("0e9e55be-800c-416d-a24c-32672d5c66c3"), // Vhost.vn
        [25] = Guid.Parse("e78afcb1-614f-4e07-a878-6c55ba3730f5"), // Xdata.vn
        [29] = Guid.Parse("55b32b79-7d20-4e6f-8530-c31d56d00f52"), // TinoHost
        [30] = Guid.Parse("c7349bdb-c39d-472f-a055-e367274d6ba3"), // HostingViet.vn
        [31] = Guid.Parse("739afd0d-bc0c-418b-b7b9-fae2c6dbe31e"), // iNET.vn → iNet.vn
        [34] = Guid.Parse("d7837e2c-851f-4c4d-a17e-1404557f8b03"), // Tenten → TenTen
    };

    // 15 mã cũ KHÔNG có trong danh mục mới → map về "Khác", giữ tên gốc vào ISPidKhac để không mất thông tin.
    private static readonly Dictionary<int, string> IspCodeToOtherName = new()
    {
        [3]  = "VDC",
        [7]  = "Vinahost",
        [9]  = "VDS Datacenter",
        [10] = "Digistar",
        [12] = "3CdotCom",
        [15] = "DigiPower",
        [21] = "FIBO",
        [22] = "Bizweb (Sapo)",
        [23] = "CNV.VN",
        [26] = "VNNetsoft",
        [27] = "SPT",
        [28] = "VMMS",
        [32] = "ZoZo.vn",
        [33] = "ESC",
        [35] = "Vietnix",
    };

    // Trả về (ISPId, ISPidKhac) tương ứng với mã hosting cũ.
    private static (Guid ISPId, string? ISPidKhac) ResolveIsp(int oldCode, ILogger log, long rowId)
    {
        if (IspCodeToGuid.TryGetValue(oldCode, out var guid))
            return (guid, null);

        if (IspCodeToOtherName.TryGetValue(oldCode, out var name))
            return (KhacIspId, name); // "Khác" + giữ tên NCC gốc

        // Mã 0 / không xác định (không nằm trong 1..35)
        log.LogWarning("AuthenticationContract Id={Id}: ISPId cũ = {Code} không có trong danh mục → dùng 'Khác'", rowId, oldCode);
        return (KhacIspId, null);
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
                new { T = "AuthenticationContract", Id = oldId, Reason = reason });
        }
        catch { }
    }
}
