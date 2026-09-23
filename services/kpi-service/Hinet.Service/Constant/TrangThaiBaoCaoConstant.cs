using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class TrangThaiBaoCaoConstant
    {
        [DisplayName("Bản nháp")]
        public static string DRAFT => "DRAFT";

        [DisplayName("Đã nộp/Chờ tiếp nhận")]
        public static string SUBMITTED => "SUBMITTED";

        [DisplayName("Đang xử lý/Chờ duyệt")]
        public static string PROCESSING => "PROCESSING";

        [DisplayName("Yêu cầu bổ sung/Làm lại")]
        public static string REJECTED_FOR_REVISION => "REJECTED_FOR_REVISION";

        [DisplayName("Từ chối phê duyệt")]
        public static string REJECTED => "REJECTED";

        [DisplayName("Đã phê duyệt")]
        public static string APPROVED => "APPROVED";

        [DisplayName("Đã thu hồi")] // Trạng thái khi người nộp tự rút lại báo cáo khi chưa được duyệt
        public static string REVOKED => "REVOKED";
    }
}
