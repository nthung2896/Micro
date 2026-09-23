using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.AppUserService.Request
{
    public class ResetPasswordViewModel
    {
        [Required(ErrorMessage = "Vui lòng nhập thông tin này")]
        public string? UserName { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập thông tin này")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string? Password { get; set; }
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        [Required(ErrorMessage = "Vui lòng nhập thông tin này")]

        public string? ConfirmPassword { get; set; }

        public string? Token { get; set; }
    }
}
