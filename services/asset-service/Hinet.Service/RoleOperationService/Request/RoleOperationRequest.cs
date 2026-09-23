
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.RoleOperationService.Request
{
    public class RoleOperationRequest
    {
        public Guid? Id { get; set; }
        public Guid RoleId { get; set; }
        public List<OperationIdRequest> ListOperationRequest { get; set; } = new List<OperationIdRequest>();
    }

    public class OperationIdRequest
    {
        public int IsAccess { get; set; }
        public Guid OperationId { get; set; }
    }
}