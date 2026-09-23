namespace Hinet.FileServer.Configuration
{
    // Mã loại tài liệu đính kèm cho Nền tảng TMĐT.
    // Code dùng PascalCase tiếng Việt unaccented (folder/URL safe).
    // Mirror:
    //   FE: Client/src/constants/LoaiTaiLieuPlatformConstant.ts
    //   BE: Hinet.Service/Constant/LoaiTaiLieuPlatformConstant.cs
    public static class LoaiTaiLieuPlatformConstant
    {
        public const string ChuSoHuuWebsite       = "ChuSoHuuWebsite";
        public const string HangHoaDichVu         = "HangHoaDichVu";
        public const string ThongTinGia           = "ThongTinGia";
        public const string DieuKienGiaoDichChung = "DieuKienGiaoDichChung";
        public const string ChinhSachBaoMat       = "ChinhSachBaoMat";
        public const string SoHuuTenMien          = "SoHuuTenMien";
        public const string PlatformLogo          = "PlatformLogo";
        public const string PlatformImagePath     = "PlatformImagePath";
        public const string PlatformSeal          = "PlatformSeal";
        public const string OrganizationFileDangKyUyQuyen = "OrganizationFileDangKyUyQuyen";
        public const string PhuongThucTiepNhan      = "PhuongThucTiepNhan";
        public const string ChinhSachGia          = "ChinhSachGia";
        public const string ChinhSachThanhToan    = "ChinhSachThanhToan";
        public const string ChinhSachGiaoHang     = "ChinhSachGiaoHang";
        public const string HinhThucHoTroTrucTuyen = "HinhThucHoTroTrucTuyen";
        public const string DieuKienCungCapHangHoaDichVu = "DieuKienCungCapHangHoaDichVu";
        public const string ToKhaiThongTinMauSo02 = "ToKhaiThongTinMauSo02";
        public const string BanChupGiayPhep       = "BanChupGiayPhep";
        public const string DeAnHoatDongTMDT      = "DeAnHoatDongTMDT";
        public const string QuyCheHoatDongLivestream = "QuyCheHoatDongLivestream";
        public const string MauHopDongThoaThuan   = "MauHopDongThoaThuan";
        public const string Khac                  = "Khac";

        public static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
        {
            ChuSoHuuWebsite, HangHoaDichVu, ThongTinGia,
            DieuKienGiaoDichChung, ChinhSachBaoMat, SoHuuTenMien,
            PlatformLogo, PlatformImagePath, PlatformSeal,
            OrganizationFileDangKyUyQuyen, PhuongThucTiepNhan, ChinhSachGia,
            ChinhSachThanhToan, ChinhSachGiaoHang, HinhThucHoTroTrucTuyen,
            DieuKienCungCapHangHoaDichVu, ToKhaiThongTinMauSo02, BanChupGiayPhep,
            DeAnHoatDongTMDT, QuyCheHoatDongLivestream, MauHopDongThoaThuan,
            Khac,
        };

        public static bool IsValid(string? code) =>
            !string.IsNullOrWhiteSpace(code) && All.Contains(code);
    }
}
