using System.ComponentModel;

namespace Hinet.Service.Constant
{
    public class CompanyInfoStatusConstant
    {
        [DisplayName("Mới tạo")]            public static int MoiTao => 0;
        [DisplayName("Đã duyệt")]           public static int DaDuyet => 1;
        [DisplayName("Bổ sung")]            public static int BoSung => 2;
        [DisplayName("Chỉnh sửa")]          public static int ChinhSua => 3;
        [DisplayName("Từ chối")]            public static int TuChoi => 4;
        [DisplayName("Bị khoá")]            public static int BiKhoa => 5;
        [DisplayName("Chấm dứt")]           public static int ChamDut => 6;
        [DisplayName("Chờ duyệt")]          public static int ChoDuyet => 7;
        [DisplayName("Đề nghị chấm dứt")]   public static int DeNghiChamDut => 8;
    }
}
