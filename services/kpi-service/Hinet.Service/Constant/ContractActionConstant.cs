using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class ContractActionConstant
    {
        // doanh nghiệp

        [DisplayName("Tạm lưu")]
        public static int TamLuu => 0;

        [DisplayName("Gửi đăng ký")]
        public static int GuiDangKy => 1;

        [DisplayName("Gửi bổ sung thông tin")]
        public static int GuiBoSungThongTin => 2;

        [DisplayName("Đề nghị gia hạn")]
        public static int DeNghiGiaHan => 3;

        [DisplayName("Đề nghị chấm dứt đăng ký")]
        public static int DeNghiChamDutDangKy => 4;

        [DisplayName("Hủy đăng ký")]
        public static int HuyDangKy => 5;

        // xử lý nội bộ

        [DisplayName("Phân công xử lý")]
        public static int PhanCongXuLy => 10;

        [DisplayName("Nhận xử lý")]
        public static int NhanXuLy => 11;

        // chuyên viên

        [DisplayName("Yêu cầu bổ sung thông tin")]
        public static int YeuCauBoSungThongTin => 20;

        [DisplayName("Từ chối")]
        public static int TuChoi => 21;

        [DisplayName("Duyệt điện tử")]
        public static int DuyetDienTu => 22;

        // trưởng phòng

        // [DisplayName("Yêu cầu bản giấy")]
        // public static int YeuCauBanGiay => 30;

        [DisplayName("Đã review")]
        public static int Review => 31;

        // lãnh đạo

        [DisplayName("Xác nhận")]
        public static int XacNhan => 40;

        // hệ thống

        [DisplayName("Tự động đóng")]
        public static int AutoClose => 90;

        [DisplayName("Tự động hết hạn")]
        public static int AutoExpire => 91;

        [DisplayName("Chấm dứt đăng ký")]
        public static int ChamDutDangKy => 90;

        [DisplayName("Xác nhận chấm dứt đăng ký")]
        public static int XacNhanChamDut => 89;

        [DisplayName("Đề nghị chỉnh sửa")]
        public static int DeNghiChinhSua => 88;
    }
}
