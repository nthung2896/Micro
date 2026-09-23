using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class TrangThaiVuViecPhanAnhConstant
    {
        [DisplayName("Chưa xử lý")]
        public static int ChuaXuLy => 0;

        [DisplayName("Đang xử lý")]
        public static int DangXuLy => 1;

        [DisplayName("Đã xử lý")]
        public static int DaXuLy => 2;

        [DisplayName("Yêu cầu giải trình")]
        public static int YeuCauGiaiTrinh => 3;

        [DisplayName("Đã giải trình")]
        public static int DaGiaiTrinh => 4;

        [DisplayName("Yêu cầu giải trình lại")]
        public static int YeuCauGiaiTrinhLai => 5;
    }
}
