using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.AppUserService.Request
{
    public class AppUserEditViewModel
    {
        public string? MaCanBo { get; set; }
        public string? FamilyName { get; set; }
        public string? Name { get; set; }
        public string? GivenName { get; set; }
        public int Gender { get; set; }
        public string? CCCD { get; set; }
        public string? Avatar { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
        public DateTime? NgaySinh { get; set; }


    }
}
