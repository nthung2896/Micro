using System.ComponentModel;
namespace Hinet.Service.Constant
{
    public class LogLevelConstant
    {
        [DisplayName("Thông báo")]
        public static string Info => "Info";

        [DisplayName("Cảnh báo")]
        public static string Warning => "Warning";

        [DisplayName("Lỗi")]
        public static string Error => "Error";

    }
}
