using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityService.Entities
{
    [Table("Operation")]
    public class Operation
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ModuleId { get; set; }

        [Required]
        [MaxLength(250)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(250)]
        public string Url { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Code { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Css { get; set; }

        public bool IsShow { get; set; } = true;
        public int Order { get; set; } = 0;

        [MaxLength(100)]
        public string? Icon { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public Guid? UpdatedId { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
