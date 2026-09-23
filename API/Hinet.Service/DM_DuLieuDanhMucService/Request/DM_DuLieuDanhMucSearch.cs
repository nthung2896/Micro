using Hinet.Service.Common;
using Hinet.Service.Dto;

namespace Hinet.Service.DM_DuLieuDanhMucService.Request
{
    public class DM_DuLieuDanhMucSearch : SearchBase
    {
        public string? GroupId { get; set; }
        public string? Name { get; set; }
        public string? Code { get; set; }
        public string? Note { get; set; }
        public int? Priority { get; set; }
    }
}
