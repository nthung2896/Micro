using Hinet.Service.RoleService.Request;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.DepartmentService.Request
{
    public class DepartmentVM
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Code { get; set; }
        public Guid? ParentId { get; set; }
        public long? Priority { get; set; } = 1;
        public int Level { get; set; }
        public bool IsActive { get; set; } = true;
        public string? MaTinh { get; set; }
        public List<DepartmentVM> DepartmentChilds { get; set; } = new List<DepartmentVM>();
        public List<RoleVM> Roles { get; set; } = new List<RoleVM>();
    }
}
