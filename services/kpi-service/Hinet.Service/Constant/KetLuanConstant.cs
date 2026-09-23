using System.ComponentModel;

namespace Hinet.Service.Constant
{
    public class KetLuanConstant
    {
        [DisplayName("Chưa kết luận")]
        public static int ChuaKetLuan => 0;
        [DisplayName("Có vi phạm")]
        public static int CoViPham => 1;
        [DisplayName("Không vi phạm")]
        public static int KhongViPham => 2;
    }
}
