using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("Room_GiaoDichNapTien")]
    public class Room_GiaoDichNapTien : AuditableEntity
    {
        [Required]
        [StringLength(50)]
        public string MaGiaoDich { get; set; } = string.Empty;

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual AppUser? User { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoTienNap { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TienKhuyenMai { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TongNhan { get; set; } = 0;

        [Required]
        [StringLength(50)]
        public string PhuongThuc { get; set; } = "VIETQR"; // VIETQR, MOMO, VNPAY, BANK_TRANSFER

        [Required]
        [StringLength(100)]
        public string NoiDungChuyenKhoan { get; set; } = string.Empty;

        /// <summary>
        /// 0: Chờ thanh toán, 1: Thành công, 2: Thất bại, 3: Đã hủy
        /// </summary>
        public int TrangThai { get; set; } = 0;

        [StringLength(100)]
        public string? MaGiaoDichDoiTac { get; set; }

        public DateTime? ThoiGianThanhToan { get; set; }

        [StringLength(500)]
        public string? GhiChu { get; set; }

        public Guid? NguoiDuyetId { get; set; }

        [StringLength(250)]
        public string? NguoiDuyetName { get; set; }
    }
}
