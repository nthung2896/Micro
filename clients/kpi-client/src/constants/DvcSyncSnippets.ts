// Code mau C# cho trang DvcSyncTest
// De tranh xung dot giua template literal JS va code C#

export const CSharpCode = {

  B1_GetToken: `var tokenRes = await _dvcSyncService.GetTokenAsync(new DvcTokenRequest
{
    ClientId = AppSettings.DvcSync.ClientId,
    ClientSecret = AppSettings.DvcSync.ClientSecret
});
var token = tokenRes?.Data?.AccessToken;
if (token == null) throw new Exception("Khong lay duoc token");`,

  B2_GetNextValue: `var nextVal = await _dvcSyncService.GetNextValueAsync(
    AppSettings.DvcSync.MaTTHC, token);
hoso.DvcMaHoSo = nextVal?.Value;`,

  B3_UploadFile: `var files = await _taiLieuDinhKemService.GetByItemId(hoso.Id);
foreach (var file in files)
{
    var stream = await _taiLieuDinhKemService.GetStreamAsync(file.Id);
    var uploadRes = await _dvcSyncService.UploadFileAsync(
        stream, file.TenTaiLieu ?? "file", token);
    if (uploadRes?.Data?.Count > 0)
    {
        _dbContext.DvcSyncFileMap.Add(new DvcSyncFileMap
        {
            PlatformManageId = hoso.Id,
            IdGiayTo = uploadRes.Data[0].IdTepTin,
            HashTepTin = uploadRes.Data[0].HashTepTin,
            TenFile = file.TenTaiLieu ?? "file",
            TrangThai = 0
        });
    }
}
await _dbContext.SaveChangesAsync();`,

  B4_CreateDossier: `var dbFiles = await _dbContext.DvcSyncFileMap
    .Where(f => f.PlatformManageId == hoso.Id && f.TrangThai == 0 && !f.IsDeleted)
    .ToListAsync();

var dossierJson = new
{
    MaHoSo = hoso.DvcMaHoSo,
    MaTTHC = AppSettings.DvcSync.MaTTHC,
    MaDichVuCong = AppSettings.DvcSync.MaDichVuCong,
    ChuHoSo = hoso.CompanyName,
    LoaiDoiTuong = 1,
    MaDonViTiepNhan = AppSettings.DvcSync.MaDonViTiepNhan,
    EformThongTinChiTiet = new {
        TenNenTang = hoso.Name,
        Domain = hoso.Domain,
        TenDoanhNghiep = hoso.CompanyName,
        MaSoThue = hoso.CompanyTaxCode
    },
    ThanhPhanHoSo = new[] {
        new {
            MaThanhPhanHoSo = "000.00.00.DVC-THONGTIN",
            TenThanhPhanHoSo = "Thong tin dang ky nen tang",
            SoLuong = dbFiles.Count,  LoaiBan = 2,
            GiayToDinhKem = dbFiles.Select(f => new {
                IdGiayTo = f.IdGiayTo,
                HashTepTin = f.HashTepTin,
                TenGiayTo = f.TenFile,
                MaKetQua = "KQ.DVC.THONGTIN"
            }).ToList()
        }
    },
    ThongTinNguoiNop = new {
        LoaiDoiTuong = 1,
        ThongTinChiTiet = new { TenNguoiNop = hoso.CompanyName }
    }
};
var dossierRes = await _dvcSyncService.CreateDossierAsync(dossierJson, token);

var parsed = JsonSerializer.Deserialize<DvcApiResponse<DvcCreateDossierResponse>>(dossierRes);
hoso.DvcIdHoSo = parsed?.Data?.IdHoSo;
hoso.DvcSyncStatus = 2;
hoso.DvcSyncDate = DateTime.Now;
await _platformRepo.SaveAsync();`,

  B5_CapNhatTienTrinh: `var tienTrinh = new[]
{
    new {
        IDHoSo = hoso.DvcIdHoSo,
        MaHoSo = hoso.DvcMaHoSo ?? "",
        NguoiXuLy = "Ten can bo",
        ThoiDiemXuLy = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fff"),
        PhongBanXuLy = "Phong dang xu ly",
        NoiDungXuLy = "Noi dung xu ly",
        TrangThai = 4,
        NgayBatDau = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fff"),
        NgayKetThucTheoQuyDinh = DateTime.Now.AddDays(10)
            .ToString("yyyy-MM-ddTHH:mm:ss.fff")
    }
};
var result = await _dvcSyncService.CapNhatTienTrinhAsync(tienTrinh, token);`,

  B6_CapNhatTrangThai: `var trangThai = new[]
{
    new {
        IdHoSo = hoso.DvcIdHoSo ?? "",
        MaHoSo = hoso.DvcMaHoSo ?? "",
        TrangThai = 6,   // 6: Yeu cau thuc hien nghia vu tai chinh
        NoiDungYKien = "Yeu cau nop le phi tham dinh ho so",
        PhongBanXuLy = "Phong nghiep vu",
        NoiDungXuLy = "Ho so can dong le phi truoc khi xu ly",

        // DanhSachLePhi & DanhSachGiayToKetQua chi dung o trang thai 5,6,9
        DanhSachLePhi = new[]
        {
            new {
                TenPhiLePhi = "Le phi tham dinh ho so nen tang",
                MaPhiLePhi = "LP.THAMDINH",
                // HinhThucThu: 1=Khi tiep nhan, 2=Khi bo sung, 4=Khi tra ket qua
                HinhThucThu = "1",
                Gia = "135000",
                // LoaiPhiLePhi: 1=Thong thuong, 2=Tham dinh cap phep, 3=Gia han
                LoaiPhiLePhi = "2"
            }
        }
    }
};
var result = await _dvcSyncService.CapNhatTrangThaiAsync(trangThai, token);`,

  AutoSyncHook: `private async Task SynchDataToDvcAndTaxAsync(PlatformManage hoso)
{
    try
    {
        var result = await _dvcPlatformSyncService.SyncPlatformAsync(hoso.Id);
        if (result.Success)
            _logger.LogInformation("Dong bo thanh cong. MaHoSo={MaHoSo}", result.DvcMaHoSo);
        else
            _logger.LogWarning("Dong bo that bai: {Error}", result.ErrorMessage);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Loi dong bo platform {Id}", hoso.Id);
    }
}`,

  DTOs: `public class DvcTokenRequest
{
    [JsonPropertyName("client_id")] public string ClientId { get; set; }
    [JsonPropertyName("client_secret")] public string ClientSecret { get; set; }
}

public class DvcTokenResponse
{
    [JsonPropertyName("access_token")] public string AccessToken { get; set; }
    [JsonPropertyName("expires_in")] public int ExpiresIn { get; set; }
    [JsonPropertyName("token_type")] public string TokenType { get; set; }
    [JsonPropertyName("scope")] public string Scope { get; set; }
}

public class DvcFileUploadResponse
{
    [JsonPropertyName("IdTepTin")] public string IdTepTin { get; set; }
    [JsonPropertyName("HashTepTin")] public string HashTepTin { get; set; }
}

public class DvcApiResponse<T>
{
    [JsonPropertyName("code")] public int Code { get; set; }
    [JsonPropertyName("message")] public string Message { get; set; }
    [JsonPropertyName("data")] public T Data { get; set; }
}`,
};
