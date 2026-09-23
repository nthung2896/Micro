using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Hinet.FileServer.Model.Entities
{
    [Table("TaiLieuDinhKem")]
    public class TaiLieuDinhKem : AuditableEntity
    {
        public long? KichThuoc { get; set; }
        [Required]
        [StringLength(500)]
        public string TenTaiLieu { get; set; } = "";
        [StringLength(250)]
        public string? LoaiTaiLieu { get; set; } = "";
        public Guid? ItemId { get; set; }
        public string DuongDanFile { get; set; } = "";
        public string DuongDanFilePDF { get; set; } = "";
        [StringLength(250)]
        public string Extension { get; set; } = "";
        public Guid? UserId { get; set; }
        public bool? IsKySo { get; set; }
        public string? NguoiKy { get; set; }
        public string? DonViPhatHanh { get; set; }
        public string? NgayKy { get; set; }
        public bool? CoChuKySo { get; set; }

        // Cột chung với Hinet.Model (NOT NULL trong DB) — luôn ghi chuỗi rỗng nếu FileServer không dùng.
        public string TenTaiLieuText { get; set; } = "";
    }
}
