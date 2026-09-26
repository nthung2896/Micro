using System;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Model.Entities
{
    public interface IAuditableEntity
    {
        Guid Id { get; set; }
        DateTime CreatedDate { get; set; }
        string? CreatedBy { get; set; }
        Guid? CreatedId { get; set; }
        DateTime UpdatedDate { get; set; }
        string? UpdatedBy { get; set; }
        Guid? UpdatedId { get; set; }
        bool IsDeleted { get; set; }
        DateTime? DeleteDate { get; set; }
        string? DeleteBy { get; set; }
        Guid? DeleteId { get; set; }
    }

    public abstract class AuditableEntity : IAuditableEntity
    {
        [Key]
        public virtual Guid Id { get; set; } = Guid.NewGuid();

        public virtual DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public virtual string? CreatedBy { get; set; }
        public virtual Guid? CreatedId { get; set; }
        public virtual DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
        public virtual string? UpdatedBy { get; set; }
        public virtual Guid? UpdatedId { get; set; }
        public virtual bool IsDeleted { get; set; } = false;
        public virtual DateTime? DeleteDate { get; set; }
        public virtual string? DeleteBy { get; set; }
        public virtual Guid? DeleteId { get; set; }
    }
}
