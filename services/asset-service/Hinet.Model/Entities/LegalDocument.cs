using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("LegalDocument")]
    public class LegalDocument : AuditableEntity
    {
        [StringLength(500)]
        public string? LoaiVanBan { get; set; }

        // Số hiệu văn bản
        [StringLength(250)]
        public string? Code { get; set; }

        public DateTime? PublicDate { get; set; }
        public string? PublicBy { get; set; }

        // Ngày có hiệu lực
        public DateTime? ActivedDate { get; set; }

        // Ngày hết hạn
        public DateTime? ExpiredDate { get; set; }

        // Người ký
        public string? SignedBy { get; set; }

        // File
        [Required]
        public string Document { get; set; } = "";

        // Trích dẫn
        [StringLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "text")]
        public string? Content { get; set; }

        public string? Status { get; set; }
        public string? LoaiHeThong { get; set; }
    }
}
