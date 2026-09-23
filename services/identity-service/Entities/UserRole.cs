using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityService.Entities
{
    [Table("UserRole")]
    public class UserRole
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid RoleId { get; set; }

        public Guid DepartmentId { get; set; } = Guid.Empty;

        [MaxLength(100)]
        public string? KhoiCode { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public Guid? UpdatedId { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
