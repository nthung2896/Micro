using System;

namespace Hinet.Migration.OldModels
{
    public class OldAuthConstractCategory
    {
        public long Id { get; set; }
        public long AuthConstactId { get; set; }
        public string? TypeValue { get; set; }

        // AuditableEntity fields
        public DateTime CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public long? CreatedID { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public long? UpdatedID { get; set; }
    }
}
