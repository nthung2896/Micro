using Hinet.Service.Dto;

namespace Hinet.Service.AppConfigurationService.Dto
{
    public class AppConfigurationSearch : SearchBase
    {
        public string? TenApp { get; set; }
        public string? TenDoanhNghiep { get; set; }
        public string? DiaChi { get; set; }
        public string? SoDienThoai { get; set; }
        public string? Email { get; set; }
        public string? LogoLink { get; set; }
        public string? LoginBackgroundLink { get; set; }
        public string? LoginModalImage { get; set; }
        public string? PrimaryColor { get; set; }
        public bool? isActive { get; set; }
    }
}
