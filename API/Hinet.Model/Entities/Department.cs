using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Hinet.Model.Entities
{
    [Table("Department")]
    public class Department : AuditableEntity
    {
        [Required]
        [StringLength(250)]
        public string Name { get; set; }
        public string? ShortName { get; set; }
        [Required]
        [StringLength(250)]
        public string Code { get; set; }
        public Guid? ParentId { get; set; }
        public long? Priority { get; set; } = 1;
        public int Level { get; set; }
        public string Loai { get; set; }
        public bool IsActive { get; set; } = true;
        public string? DiaDanh { get; set; }
        public string? MaTinh { get; set; }
        public string? Address { get; set; }
        public string? Hotline { get; set; }
        public string? Email { get; set; }

    }
}
