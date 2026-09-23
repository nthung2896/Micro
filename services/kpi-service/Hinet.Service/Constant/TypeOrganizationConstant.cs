using System.ComponentModel;

namespace Hinet.Service.Constant
{
    public class TypeOrganizationConstant
    {
        [DisplayName("Doanh nghiệp")]
        public static string Company => "Company";

        [DisplayName("Cá nhân")]
        public static string Personal => "Personal";

        [DisplayName("Tổ chức")]
        public static string Organization => "Organization";
    }
}
