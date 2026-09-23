using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("RoleOperation")]
    public class RoleOperation : AuditableEntity
    {
        [Required]
        public Guid RoleId { get; set; }

        [Required]
        public Guid OperationId { get; set; }

        [Required]
        public int IsAccess { get; set; }
    }
}
