using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("Role")]
    public class Role : AuditableEntity
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Code { get; set; }

        public string? Type { get; set; }

        public bool IsActive { get; set; } = false;

        public Guid? DepartmentId { get; set; }
    }
}
