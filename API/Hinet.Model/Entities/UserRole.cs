using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("UserRole")]
    public class UserRole : AuditableEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid RoleId { get; set; }

        public Guid DepartmentId { get; set; }

        public string? KhoiCode { get; set; }
    }
}
