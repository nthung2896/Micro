using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("Room_CauHinhKhuyenMaiNap")]
    public class Room_CauHinhKhuyenMaiNap : AuditableEntity
    {
        [Required]
        [StringLength(250)]
        public string TenChuongTrinh { get; set; } = string.Empty;

        /// <summary>
        /// 1: Nạp lần đầu, 2: Bậc thang nạp, 3: Coupon
        /// </summary>
        public int LoaiKhuyenMai { get; set; } = 2;

        [Column(TypeName = "decimal(18,2)")]
        public decimal MucNapToiThieu { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MucNapToiDa { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal PhanTramKhuyenMai { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TienThuongCoDinh { get; set; } = 0;

        public DateTime? NgayBatDau { get; set; }

        public DateTime? NgayKetThuc { get; set; }

        public bool IsActive { get; set; } = true;

        public int ThuTu { get; set; } = 0;

        [StringLength(500)]
        public string? GhiChu { get; set; }
    }
}
