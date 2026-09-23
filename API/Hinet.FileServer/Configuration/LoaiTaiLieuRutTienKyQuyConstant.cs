namespace Hinet.FileServer.Configuration
{
    // Mã loại tài liệu đính kèm cho Rút tiền ký quỹ.
    // Mirror:
    //   FE: Client/src/constants/LoaiTaiLieuRutTienKyQuyConstant.ts
    //   BE: Hinet.Service/Constant/LoaiTaiLieuRutTienKyQuyConstant.cs
    public static class LoaiTaiLieuRutTienKyQuyConstant
    {
        public const string DonDeNghi     = "DonDeNghi";
        public const string VanBanKemTheo = "VanBanKemTheo";

        public static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
        {
            DonDeNghi, VanBanKemTheo,
        };

        public static bool IsValid(string? code) =>
            !string.IsNullOrWhiteSpace(code) && All.Contains(code);
    }
}
