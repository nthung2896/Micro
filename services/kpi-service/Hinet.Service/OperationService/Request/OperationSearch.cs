using Hinet.Service.Common;
using Hinet.Service.Dto;

namespace Hinet.Service.OperationService.Request
{
    public class OperationSearch : SearchBase
    {
        public Guid? ModuleId { get; set; }
        public string? Name { get; set; }
        public string? Url { get; set; }
        public string? Code { get; set; }
        public bool? IsShow { get; set; }
    }
}
