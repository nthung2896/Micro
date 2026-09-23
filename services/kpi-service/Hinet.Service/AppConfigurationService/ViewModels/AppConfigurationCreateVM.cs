using System;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.AppConfigurationService.ViewModels
{
    public class AppConfigurationCreateVM
    {
        [Required(ErrorMessage = "Vui lòng nhập tên ứng dụng")]
        public string TenApp { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập tên doanh nghiệp / đơn vị")]
        public string TenDoanhNghiep { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập địa chỉ")]
        public string DiaChi { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập số điện thoại")]
        public string SoDienThoai { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập email")]
        public string Email { get; set; }

        public string? LogoLink { get; set; }

        public string? LoginBackgroundLink { get; set; }

        public string? LoginModalImage { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập màu chủ đạo")]
        public string PrimaryColor { get; set; }

        public bool? isActive { get; set; }

        public Guid? LogoFileId { get; set; }
        public Guid? BgFileId { get; set; }
        public Guid? LoginModalImageFileId { get; set; }
    }
}