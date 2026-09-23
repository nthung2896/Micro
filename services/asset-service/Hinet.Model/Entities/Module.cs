using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("Module")]
    public class Module : AuditableEntity
    {
        [Required]
        [StringLength(250)]
        public string Code { get; set; }
        [Required]
        [StringLength(250)]
        public string Name { get; set; }
        public int Order { get; set; }
        [Required]
        public bool IsShow { get; set; }
        public string? Icon { get; set; }
        public string? ClassCss { get; set; }
        public string? StyleCss { get; set; }
        public string? Link { get; set; }
        public bool? AllowFilterScope { get; set; }
        public bool? IsMobile { get; set; }
    }
}
