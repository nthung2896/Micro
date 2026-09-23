using System;
using System.Collections.Generic;
using Hinet.Service.TaiLieuDinhKemService.Dto;

namespace Hinet.Service.LegalDocumentService.Dto
{
    public class LegalDocumentDto
    {
        public Guid Id { get; set; }
        public string? LoaiVanBan { get; set; }
        public string? Code { get; set; }
        public DateTime? PublicDate { get; set; }
        public string? PublicBy { get; set; }
        public DateTime? ActivedDate { get; set; }
        public DateTime? ExpiredDate { get; set; }
        public string? SignedBy { get; set; }
        public string Document { get; set; } = "";
        public string? Description { get; set; }
        public string? Content { get; set; }
        public string? Status { get; set; }
        public string? StatusName { get; set; }
        public string? LoaiHeThong { get; set; }
        public string? LoaiHeThongName { get; set; }

        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }

        public List<TaiLieuDinhKemDto> DinhKem { get; set; } = new List<TaiLieuDinhKemDto>();
    }
}
