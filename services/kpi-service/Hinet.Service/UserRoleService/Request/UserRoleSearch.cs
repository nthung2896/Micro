using Hinet.Service.Dto;


namespace Hinet.Service.UserRoleService.Request
{
    public class UserRoleSearch : SearchBase
    {
        public string? UserId { get; set; }
        public string? RoleId { get; set; }
        public string? CreatedId { get; set; }
        public string? UpdatedId { get; set; }
    }
}
