using System.ComponentModel;

namespace Hinet.Service.Constant
{
    public class PlatformManageTypeConstant
    {
        [DisplayName("Nền tảng TMĐT kinh doanh trực tiếp có chức năng đặt hàng trực tuyến")]
        public static string NTThongBaoKD => "NTThongBaoKD";

        [DisplayName("Nền tảng TMĐT kinh doanh trực tiếp nước ngoài có chức năng đặt hàng trực tuyến có hoạt động TMĐT tại Việt Nam")]
        public static string NTDangKyKDNuocNgoai => "NTDangKyKDNuocNgoai";

        [DisplayName("Nền tảng TMĐT trung gian, mạng xã hội hoạt động TMĐT, nền tảng TMĐT tích hợp")]
        public static string NTTichHop => "NTTichHop";

        [DisplayName("Nền tảng TMĐT trung gian nước ngoài, mạng xã hội hoạt động TMĐT nước ngoài, nền tảng TMĐT tích hợp nước ngoài")]
        public static string NTTichHopNuocNgoai => "NTTichHopNuocNgoai";
    }
}
