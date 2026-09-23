using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("ApiPermissions")]
    public class ApiPermissions : AuditableEntity
    {
        public Guid? UserId { get; set; }

        public Guid? RoleId { get; set; }

        public string? Path { get; set; }
    }
}
