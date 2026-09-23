using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.AppUserService.Request
{
    public class LoginViewModel
    {
        [Required]
        public string? UserName { get; set; }
        [Required]
        [StringLength(50, MinimumLength = 6)]
        public string? Password { get; set; }
    }

    public class LoginSSOViewModel
    {
        [Required]
        public string? Code { get; set; }

    }
}
