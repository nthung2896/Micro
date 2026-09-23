using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("Room_ThongTinNganHang")]
    public class Room_ThongTinNganHang : AuditableEntity
    {
        [Required]
        [StringLength(50)]
        public string NganHangCode { get; set; } = "MB"; // MB, VCB, ICB, TCB...

        [Required]
        [StringLength(150)]
        public string TenNganHang { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string SoTaiKhoan { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string ChuTaiKhoan { get; set; } = string.Empty;

        [StringLength(250)]
        public string? ChiNhanh { get; set; }

        public bool IsDefault { get; set; } = true;

        public bool IsActive { get; set; } = true;
    }
}
