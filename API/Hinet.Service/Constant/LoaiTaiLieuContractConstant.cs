using System.ComponentModel;

namespace Hinet.Service.Constant
{
    // Mã loại tài liệu đính kèm cho Hợp đồng Chứng thực (AuthenticationContract).
    // Mirror FE: Client/src/constants/LoaiTaiLieuContractConstant.ts
    public class LoaiTaiLieuContractConstant
    {
        [DisplayName("Tài liệu chứng minh sở hữu tên miền")]
        public static string ChungMinhTenMien => "ChungMinhTenMien";

        public static readonly HashSet<string> ALL = new()
        {
            ChungMinhTenMien,
        };

        public static bool IsValid(string? code) =>
            !string.IsNullOrWhiteSpace(code) && ALL.Contains(code);
    }
}
