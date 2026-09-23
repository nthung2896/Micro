using System;

namespace Hinet.Migration.OldModels
{
    public class OldContractFile
    {
        public long Id { get; set; }
        public long ContractId { get; set; }
        public string? Name { get; set; }
        public string? FileName { get; set; }
        public string? Note { get; set; }
        public int? Type { get; set; }

        // AuditableEntity fields
        public DateTime CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public long? CreatedID { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public long? UpdatedID { get; set; }
    }
}
