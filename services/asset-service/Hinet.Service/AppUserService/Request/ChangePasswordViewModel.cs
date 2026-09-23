using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.AppUserService.Request
{
    public class ChangePasswordViewModel
    {
        public string? OldPassword { get; set; }
        public string? NewPassword { get; set; }
        public string? ConfirmPassword { get; set; }
        public Guid? UserId { get; set; }
    }
}
