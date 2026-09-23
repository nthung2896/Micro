using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityService.Entities
{
    [Table("Role")]
    public class Role
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(250)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Code { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Type { get; set; }

        public bool IsActive { get; set; } = true;

        public Guid? DepartmentId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public Guid? UpdatedId { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
