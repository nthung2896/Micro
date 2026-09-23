using System.ComponentModel;

namespace Hinet.Service.Constant
{
    // Mã loại tài liệu đính kèm cho Rút tiền ký quỹ.
    // Mirror FE: Client/src/constants/LoaiTaiLieuRutTienKyQuyConstant.ts
    public class LoaiTaiLieuRutTienKyQuyConstant
    {
        [DisplayName("Đơn đề nghị")]
        public static string DonDeNghi => "DonDeNghi";

        [DisplayName("Văn bản, tài liệu kèm theo")]
        public static string VanBanKemTheo => "VanBanKemTheo";

        public static readonly HashSet<string> ALL = new()
        {
            DonDeNghi,
            VanBanKemTheo,
        };

        public static bool IsValid(string? code) =>
            !string.IsNullOrWhiteSpace(code) && ALL.Contains(code);
    }
}
