namespace Hinet.FileServer.Configuration
{
    // Mã loại tài liệu đính kèm cho Hợp đồng Chứng thực (AuthenticationContract).
    // Mirror:
    //   FE: Client/src/constants/LoaiTaiLieuContractConstant.ts
    //   BE: Hinet.Service/Constant/LoaiTaiLieuContractConstant.cs
    public static class LoaiTaiLieuContractConstant
    {
        public const string ChungMinhTenMien = "ChungMinhTenMien";

        public static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
        {
            ChungMinhTenMien,
        };

        public static bool IsValid(string? code) =>
            !string.IsNullOrWhiteSpace(code) && All.Contains(code);
    }
}
