using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("Room_ViTien")]
    public class Room_ViTien : AuditableEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual AppUser? User { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoDuChinh { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoDuKhuyenMai { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TongNap { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TongChi { get; set; } = 0;

        /// <summary>
        /// 1: Thành viên mới, 2: Bạc, 3: Vàng, 4: Kim Cương
        /// </summary>
        public int HangThanhVien { get; set; } = 1;

        /// <summary>
        /// 1: Hoạt động, 0: Khóa
        /// </summary>
        public int TrangThai { get; set; } = 1;

        [NotMapped]
        public decimal TongSoDu => SoDuChinh + SoDuKhuyenMai;
    }
}
