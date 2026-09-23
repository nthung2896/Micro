using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class TrangThaiPhanAnhNenTangConstant
    {
        [DisplayName("Mới đăng")]
        public static int MoiDang => 0;
        [DisplayName("Đã ghi nhận")]
        public static int DaGhiNhan => 1;
        [DisplayName("Đã từ chối")]
        public static int DaTuChoi => 2;
        [DisplayName("Đã kết thúc")]
        public static int DaKetThuc => 3;
    }
}
