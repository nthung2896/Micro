using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.RoleService.Request
{
    public class RoleOperationMultiRequest
    {
        public Guid Id { get; set; }
        public List<Guid> ListOperation { get; set; }
    }
}
