using System.ComponentModel;

namespace Hinet.Service.Constant
{
    // Mã loại tài liệu đính kèm cho Nền tảng TMĐT.
    // Code dùng PascalCase tiếng Việt unaccented (folder/URL safe).
    // Mirror FE: Client/src/constants/LoaiTaiLieuPlatformConstant.ts
    public class LoaiTaiLieuPlatformConstant
    {
        [DisplayName("Bản chụp thông tin về người sở hữu website")]
        public static string ChuSoHuuWebsite => "ChuSoHuuWebsite";

        [DisplayName("Bản chụp thông tin về hàng hoá, dịch vụ")]
        public static string HangHoaDichVu => "HangHoaDichVu";

        [DisplayName("Bản chụp thông tin về giá")]
        public static string ThongTinGia => "ThongTinGia";

        [DisplayName("Bản chụp thông tin về điều kiện giao dịch chung")]
        public static string DieuKienGiaoDichChung => "DieuKienGiaoDichChung";

        [DisplayName("Bản chụp chính sách bảo mật")]
        public static string ChinhSachBaoMat => "ChinhSachBaoMat";

        [DisplayName("Tài liệu chứng minh sở hữu tên miền")]
        public static string SoHuuTenMien => "SoHuuTenMien";

        [DisplayName("Logo website")]
        public static string PlatformLogo => "PlatformLogo";

        [DisplayName("Logo nền tảng")]
        public static string PlatformImagePath => "PlatformImagePath";

        [DisplayName("Biểu tượng ứng dụng")]
        public static string PlatformSeal => "PlatformSeal";

        [DisplayName("Ảnh đăng ký doanh nghiệp")]
        public static string OrganizationFileDangKyUyQuyen => "OrganizationFileDangKyUyQuyen";

        [DisplayName("Phương thức tiếp nhận và giải quyết phản ánh, yêu cầu, khiếu nại")]
        public static string PhuongThucTiepNhan => "PhuongThucTiepNhan";

        [DisplayName("Chính sách giá")]
        public static string ChinhSachGia => "ChinhSachGia";

        [DisplayName("Chính sách về thanh toán")]
        public static string ChinhSachThanhToan => "ChinhSachThanhToan";

        [DisplayName("Chính sách giao hàng, đổi trả và hoàn tiền")]
        public static string ChinhSachGiaoHang => "ChinhSachGiaoHang";

        [DisplayName("Hình thức hỗ trợ trực tuyến")]
        public static string HinhThucHoTroTrucTuyen => "HinhThucHoTroTrucTuyen";

        [DisplayName("Các điều kiện hoặc hạn chế trong việc cung cấp hàng hóa hoặc dịch vụ trên nền tảng")]
        public static string DieuKienCungCapHangHoaDichVu => "DieuKienCungCapHangHoaDichVu";

        [DisplayName("Tờ khai thông tin theo Mẫu số 02 tại Phụ lục II của Nghị định này")]
        public static string ToKhaiThongTinMauSo02 => "ToKhaiThongTinMauSo02";

        [DisplayName("Bản chụp giấy phép, giấy chứng nhận, chứng chỉ, văn bản xác nhận, chấp thuận của cơ quan có thẩm quyền hoặc các văn bản tương tự khác khi kinh doanh hàng hóa, dịch vụ thuộc Danh mục ngành, nghề đầu tư kinh doanh có điều kiện theo quy định của pháp luật về đầu tư. Trường hợp các giấy tờ, tài liệu nêu trên đã có dữ liệu điện tử bảo đảm giá trị pháp lý và có thể khai thác thông qua kết nối, chia sẻ giữa Hệ thống thông tin giải quyết thủ tục hành chính với các cơ sở dữ liệu quốc gia, cơ sở dữ liệu chuyên ngành, hệ thống thông tin dùng chung, Cổng dịch vụ công quốc gia thì không phải cung cấp lại")]
        public static string BanChupGiayPhep => "BanChupGiayPhep";

        [DisplayName("Đề án hoạt động thương mại điện tử theo nội dung quy định tại Điều 30 của Nghị định này. Mẫu Đề án theo Mẫu số 05 tại Phụ lục II của Nghị định này")]
        public static string DeAnHoatDongTMDT => "DeAnHoatDongTMDT";

        [DisplayName("Quy chế hoạt động livestream bán hàng trong trường hợp nền tảng có hoạt động livestream bán hàng")]
        public static string QuyCheHoatDongLivestream => "QuyCheHoatDongLivestream";

        [DisplayName("Mẫu hợp đồng, thỏa thuận giữa người bán với chủ quản nền tảng")]
        public static string MauHopDongThoaThuan => "MauHopDongThoaThuan";

        [DisplayName("Tài liệu khác")]
        public static string Khac => "Khac";

        public static readonly HashSet<string> ALL = new()
        {
            ChuSoHuuWebsite,
            HangHoaDichVu,
            ThongTinGia,
            DieuKienGiaoDichChung,
            ChinhSachBaoMat,
            SoHuuTenMien,
            PlatformLogo,
            PlatformImagePath,
            PlatformSeal,
            OrganizationFileDangKyUyQuyen,
            PhuongThucTiepNhan,
            ChinhSachGia,
            ChinhSachThanhToan,
            ChinhSachGiaoHang,
            HinhThucHoTroTrucTuyen,
            DieuKienCungCapHangHoaDichVu,
            ToKhaiThongTinMauSo02,
            BanChupGiayPhep,
            DeAnHoatDongTMDT,
            QuyCheHoatDongLivestream,
            MauHopDongThoaThuan,
            Khac,
        };

        public static bool IsValid(string? code) =>
            !string.IsNullOrWhiteSpace(code) && ALL.Contains(code);
    }
}
