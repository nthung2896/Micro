
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.UserRoleService.Request
{
    public class UserRoleRequest
    {
        public Guid? Id { get; set; }
        [Required]
        public Guid UserId { get; set; }

        public List<string>? RoleCode { get; set; }

        //[Required]
        //public Guid? DeparmentId{ get; set; }
        public List<Guid>? IdGroupRoles { get; set; }
    }

    public class UserRoleRequest_GanNguoi
    {
        public Guid UserId { get; set; }
        public List<Guid> ListDataRole { get; set; }
    }

    public class PermissionRowRequest
    {
        public string KhoiCode { get; set; }
        public Guid DepartmentId { get; set; }
        public List<string> RoleCodes { get; set; }
    }

    public class UserRoleBulkRequest
    {
        public Guid UserId { get; set; }
        public List<PermissionRowRequest> Permissions { get; set; }
    }
}