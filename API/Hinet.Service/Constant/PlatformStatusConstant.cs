using System.ComponentModel;

namespace Hinet.Service.Constant
{
    public class PlatformStatusConstant
    {
       
        [Description("Tạm lưu")] public const int TamLuu = 0;
        [Description("Chờ duyệt")] public const int ChoDuyet = 1;
        [Description("Đề nghị chỉnh sửa")] public const int DeNghiChinhSua = 2;
        [Description("Bị từ chối")] public const int BiTuChoi = 3;
        [Description("Đã duyệt điện tử")] public const int DaDuyetDienTu = 4;
        [Description("Đã xác nhận")] public const int DaXacNhan = 5;
        [Description("Cần bổ sung thông tin")] public const int CanBoSungThongTin = 6;
        [Description("Đã chấm dứt đăng ký")] public const int DaChamDutDangKy = 7;
        [Description("Đã huỷ đăng ký")] public const int DaHuyDangKy = 8;
        [Description("Đề nghị chấm dứt đăng ký")] public const int DeNghiChamDutDangKy = 9;
        [Description("Đã khoá")] public const int DaKhoa = 10;
        [Description("Đã yêu cầu gia hạn")] public const int DaYeuCauGiaHan = 11;
        [Description("Chờ gia hạn")] public const int ChoGiaHan = 12;

        [Description("Đang xin ý kiến")] public const int DangXinYKien = 25;
        [Description("Đã review")] public const int DaReview = 26;
        [Description("Không hợp lệ")] public const int KhongHopLe = 27;
        [Description("Cần bản giấy")] public const int CanBanGiay = 28;
    }
}