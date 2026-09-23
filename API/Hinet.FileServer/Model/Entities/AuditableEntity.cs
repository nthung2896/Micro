using System.Text.Json.Serialization;

namespace Hinet.FileServer.Model.Entities
{

    public interface IAuditableEntity
    {
        DateTime CreatedDate { get; set; }
        string? CreatedBy { get; set; }
        Guid? CreatedId { get; set; }
        DateTime UpdatedDate { get; set; }
        Guid? UpdatedId { get; set; }
        string? UpdatedBy { get; set; }
        bool IsDeleted { get; set; }
        DateTime? DeletedDate { get; set; }
        Guid? DeletedId { get; set; }
    }

    public class AuditableEntity : Entity, IAuditableEntity
    {
        public DateTime CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public Guid? UpdatedId { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedDate { get; set; }
        public Guid? DeletedId { get; set; }
    }
}
