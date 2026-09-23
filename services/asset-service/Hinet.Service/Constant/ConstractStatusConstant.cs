using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class ConstractStatusConstant
    {
        [DisplayName("Tạm lưu")]
        public static int TamLuu => 0;
        [DisplayName("Chờ duyệt")]
        public static int ChoDuyet => 1;

        [DisplayName("Đề nghị chỉnh sửa")]
        public static int DeNghiChinhSua => 2;

        [DisplayName("Bị từ chối")]
        public static int BiTuChoi => 3;

        [DisplayName("Đã duyệt điện tử")]
        public static int DaDuyetDienTu => 4;

        [DisplayName("Đã xác nhận")]
        public static int DaXacNhan => 5;

        [DisplayName("Cần bổ sung thông tin")]
        public static int CanBoSungThongTin => 6;

        [DisplayName("Đã chấm dứt đăng ký")]
        public static int DaChamDutDangKy => 7;

        [DisplayName("Đã hủy đăng ký")]
        public static int DaHuyDangKy => 8;

        [DisplayName("Đề nghị chấm dứt đăng ký")]
        public static int DeNghiChamDutDangKy => 9;

        [DisplayName("Đã yêu cầu gia hạn")]
        public static int DaYeuCauGiaHan => 11;

        [DisplayName("Chờ gia hạn")]
        public static int ChoGiaHan => 12;

        [DisplayName("Đã review")]
        public static int DaReview => 26;

        [DisplayName("Cần bản giấy")]
        public static int CanBanGiay => 28;
    }
}
