using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.AspNetUsersService.Dto
{
    public class DepartmentAndKho
    {
        public Guid DepartmentId { get; set; }
        public string KhoiCode { get; set; }
        public Guid? Id { get; set; }
        public Guid UserId { get; set; }

        public List<string>? RoleCode { get; set; }

        public List<Guid>? IdGroupRoles { get; set; }

    }
}
