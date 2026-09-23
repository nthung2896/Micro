using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IdentityService.Entities
{
    [Table("RoleOperation")]
    public class RoleOperation
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid RoleId { get; set; }

        [Required]
        public Guid OperationId { get; set; }

        [Required]
        public int IsAccess { get; set; } = 1;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public Guid? UpdatedId { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}
