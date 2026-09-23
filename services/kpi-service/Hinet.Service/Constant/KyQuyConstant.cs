using System.ComponentModel;

namespace Hinet.Service.Constant
{
    public class KyQuyConstant
    {
        [DisplayName("Tạm lưu")]                  public static int TamLuu => 0;
        [DisplayName("Chờ duyệt")]                public static int ChoDuyet => 1;
        [DisplayName("Đề nghị chỉnh sửa")]        public static int DeNghiChinhSua => 2;
        [DisplayName("Bị từ chối")]               public static int BiTuChoi => 3;
        [DisplayName("Đã duyệt điện tử")]         public static int DaDuyetDienTu => 4;
        [DisplayName("Đã xác nhận")]              public static int DaXacNhan => 5;
        [DisplayName("Cần bổ sung thông tin")]    public static int CanBoSungThongTin => 6;
        [DisplayName("Đã huỷ đăng ký")]           public static int DaHuyDangKy => 8;
        [DisplayName("Đã review")]                public static int DaReview => 26;
        [DisplayName("Cần bản giấy")]             public static int CanBanGiay => 28;
    }
}
