using Hinet.Model.Entities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("Operation")]
    public class Operation : AuditableEntity
    {
        [Required]
        public Guid ModuleId { get; set; }

        [Required]
        [StringLength(250)]
        public string Name { get; set; }

        [Required]
        [StringLength(250)]
        public string Url { get; set; }

        [Required]
        public string Code { get; set; }

        public string? Css { get; set; }

        [Required]
        public bool IsShow { get; set; }

        public int Order { get; set; }
        /// <summary>
        /// Icon hiển thị trên Mobile
        /// </summary>
        public string? Icon { get; set; }
    }
}
