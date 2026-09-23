using System;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.LegalDocumentService.Request
{
    public class LegalDocumentCreateRequest
    {
        public Guid? Id { get; set; }
        public string? LoaiVanBan { get; set; }
        public string? Code { get; set; }
        public DateTime? PublicDate { get; set; }
        public string? PublicBy { get; set; }
        public DateTime? ActivedDate { get; set; }
        public DateTime? ExpiredDate { get; set; }
        public string? SignedBy { get; set; }

        [Required(ErrorMessage = "File đính kèm không được để trống")]
        public string Document { get; set; } = "";

        public string? Description { get; set; }
        public string? Content { get; set; }
        public string? Status { get; set; }
        public string? LoaiHeThong { get; set; }
    }
}
