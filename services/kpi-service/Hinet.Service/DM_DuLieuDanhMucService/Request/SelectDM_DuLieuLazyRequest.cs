using Hinet.Model.Entities;
using System.Web;

namespace Hinet.Service.DM_DuLieuDanhMucService.Request
{
    public class SelectDM_DuLieuLazyRequest
    {
        public string GroupCode { get; set; }
        public int pageIndex { get; set; }
        public int pageSize { get; set; }
        public string? FilterName { get; set; }
        public string? Selected { get; set; }
        public List<ParentQuery>? ParentQuery { get; set; }
    }
    public class ParentQuery
    {
        public string? Key { get; set; }
        public string? Value { get; set; }
    }

}
