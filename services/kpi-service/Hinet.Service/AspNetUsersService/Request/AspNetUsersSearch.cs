using Hinet.Service.Common;
using Hinet.Service.Dto;

namespace Hinet.Service.AspNetUsersService.Request
{
    public class AspNetUsersSearch : SearchBase
    {

        public string? Name { get; set; }
        public string? Type { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? DiaChi { get; set; }
        public Guid? DonViId { get; set; }
        public Guid? ParentDonViId { get; set; }
        public Guid? DepartmentId { get; set; }
        public List<string>? VaiTro { get; set; }
        public string? Keyword { get; set; }
        public string? PhoneNumber { get; set; }
        public string? PermissionCode { get; set; }
        public Guid? CurrentUserId { get; set; }
        public List<string>? CurrentUserRoles { get; set; }
    }
}
