using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class TrangThaiDotDanhGiaConstant
    {
        [DisplayName("Đang hoạt động")]
        public static string ACTIVE => "ACTIVE";

        [DisplayName("Đã đóng/Kết thúc")]
        public static string CLOSED => "CLOSED";
    }
}
