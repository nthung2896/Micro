using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityService.Entities
{
    [Table("Module")]
    public class Module
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(250)]
        public string Name { get; set; } = string.Empty;

        public int Order { get; set; } = 0;
        public bool IsShow { get; set; } = true;

        [MaxLength(100)]
        public string? Icon { get; set; }

        [MaxLength(100)]
        public string? ClassCss { get; set; }

        [MaxLength(100)]
        public string? StyleCss { get; set; }

        [MaxLength(250)]
        public string? Link { get; set; }

        public bool? AllowFilterScope { get; set; }
        public bool? IsMobile { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public Guid? UpdatedId { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
