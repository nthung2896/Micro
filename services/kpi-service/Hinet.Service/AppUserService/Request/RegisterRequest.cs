using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.AppUserService.Request
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Vui lòng nhập họ và tên")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập số điện thoại")]
        [RegularExpression(@"^[0-9]{9,11}$", ErrorMessage = "Số điện thoại không hợp lệ (9 - 11 chữ số)")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
        [MinLength(6, ErrorMessage = "Mật khẩu tối thiểu 6 ký tự")]
        public string Password { get; set; } = string.Empty;

        public string? AccountType { get; set; }

        public string? ReferralPhone { get; set; }

        public string? UserName { get; set; }

        public string? Email { get; set; }
    }
}
