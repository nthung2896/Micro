using Hinet.Service.Common;
using Hinet.Service.Dto;

namespace Hinet.Service.DM_NhomDanhMucService.Request
{
    public class DM_NhomDanhMucSearch : SearchBase
    {
        public string? CreatedId { get; set; }
        public string? UpdatedId { get; set; }
        public string? GroupName { get; set; }
        public string? GroupCode { get; set; }
    }
}
