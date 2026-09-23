using Hinet.Service.Dto;
using System;

namespace Hinet.Service.LegalDocumentService.Request
{
    public class LegalDocumentSearch : SearchBase
    {
        public string? Keyword { get; set; }
        public string? Code { get; set; }
        public string? LoaiVanBan { get; set; }
        public string? Status { get; set; }
        public string? LoaiHeThong { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public string? PublicBy { get; set; }
        public string? SignedBy { get; set; }
        public DateTime? ActivedDateFrom { get; set; }
        public DateTime? ActivedDateTo { get; set; }
        public DateTime? ExpiredDateFrom { get; set; }
        public DateTime? ExpiredDateTo { get; set; }
        public string? Description { get; set; }
    }
}
