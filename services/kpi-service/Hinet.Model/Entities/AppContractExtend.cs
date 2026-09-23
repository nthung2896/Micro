using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    public class AppContractExtend : AuditableEntity
    {
        public string AppName { get; set; }
        public Guid? ContractId { get; set; }
        public string OsCode { get; set; }

        public string AppLink { get; set; }

        public string Logo {  get; set; }

    }
}
