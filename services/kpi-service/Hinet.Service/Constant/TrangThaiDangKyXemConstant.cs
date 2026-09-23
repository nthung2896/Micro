using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Constant
{
    public class TrangThaiDangKyXemConstant
    {
       [DisplayName("Tạm lưu")] 
       public static int TamLuu => 0;
       [DisplayName("Chờ duyệt")] 
       public static int ChoDuyet => 1;
       [DisplayName("Đã phê duyệt")] 
       public static int DaPheDuyet => 2;
       [DisplayName("Đã từ chối")] 
       public static int DaTuChoi => 3;
    }
}