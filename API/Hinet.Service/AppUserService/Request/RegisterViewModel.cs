using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.AppUserService.Request
{
    public class RegisterViewModel
    {
        public string? Email { get; set; }
        public Guid? LyLichId { get; set; }
        public string? Name { get; set; }
        public int? Gender { get; set; }

        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }

        public string? DiaChi { get; set; }
        public string? PhoneNumber { get; set; }
        public Guid PhongBanId { get; set; }
        public Guid DonViSuDungId { get; set; }
    }
}
