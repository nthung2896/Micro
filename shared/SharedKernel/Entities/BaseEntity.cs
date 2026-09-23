using System;

namespace SharedKernel.Entities
{
    public abstract class BaseEntity<TKey>
    {
        public TKey Id { get; set; } = default!;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public Guid? UpdatedId { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedDate { get; set; }
        public Guid? DeletedId { get; set; }
    }

    public abstract class BaseEntity : BaseEntity<Guid>
    {
        protected BaseEntity()
        {
            Id = Guid.NewGuid();
        }
    }
}
