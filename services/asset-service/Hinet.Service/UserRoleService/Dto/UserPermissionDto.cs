namespace Hinet.Service.UserRoleService.Dto
{
    public class UserPermissionDto
    {
        public string KhoiCode { get; set; }
        public Guid DepartmentId { get; set; }
        public List<string> RoleCodes { get; set; }
    }
}
