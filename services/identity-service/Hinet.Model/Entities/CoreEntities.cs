using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Hinet.Model.Entities
{
    [Table("AspNetUsers")]
    public class AppUser : IdentityUser<Guid>, IAuditableEntity
    {
        [MaxLength(250)]
        public string? FullName { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(500)]
        public string? Avatar { get; set; }

        public Guid? DepartmentId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public Guid? UpdatedId { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeleteDate { get; set; }
        public string? DeleteBy { get; set; }
        public Guid? DeleteId { get; set; }
    }

    [Table("AspNetRoles")]
    public class AppRole : IdentityRole<Guid>
    {
    }

    [Table("Role")]
    public class Role : AuditableEntity
    {
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
    }

    [Table("UserRole")]
    public class UserRole : AuditableEntity
    {
        public Guid UserId { get; set; }
        public Guid RoleId { get; set; }
    }

    [Table("Department")]
    public class Department : AuditableEntity
    {
        [Required]
        [MaxLength(250)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? ShortName { get; set; }

        [Required]
        [MaxLength(250)]
        public string Code { get; set; } = string.Empty;

        public Guid? ParentId { get; set; }

        public long? Priority { get; set; } = 1;

        public int Level { get; set; } = 1;

        [MaxLength(100)]
        public string? Loai { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(250)]
        public string? DiaDanh { get; set; }

        [MaxLength(50)]
        public string? MaTinh { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? Hotline { get; set; }

        [MaxLength(250)]
        public string? Email { get; set; }
    }

    [Table("Module")]
    public class Module : AuditableEntity
    {
        [Required]
        [MaxLength(250)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Code { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Icon { get; set; }

        public int Order { get; set; } = 1;

        public bool IsShow { get; set; } = true;

        [MaxLength(250)]
        public string? Link { get; set; }

        [MaxLength(100)]
        public string? ClassCss { get; set; }
    }

    [Table("Operation")]
    public class Operation : AuditableEntity
    {
        public Guid ModuleId { get; set; }

        [Required]
        [MaxLength(250)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Code { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Url { get; set; }

        public int Order { get; set; } = 1;

        public bool IsShow { get; set; } = true;
    }

    [Table("RoleOperation")]
    public class RoleOperation : AuditableEntity
    {
        public Guid RoleId { get; set; }
        public Guid OperationId { get; set; }
        public bool IsAccess { get; set; } = true;
    }
}
