using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("Room_LichSuThanhToan")]
    public class Room_LichSuThanhToan : AuditableEntity
    {
        [Required]
        [StringLength(50)]
        public string MaGiaoDich { get; set; } = string.Empty;

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual AppUser? User { get; set; }

        /// <summary>
        /// 1: Nạp tiền (+), 2: Khuyến mãi (+), 3: Chi trả dịch vụ (-), 4: Hoàn tiền (+)
        /// </summary>
        public int LoaiGiaoDich { get; set; } = 3;

        /// <summary>
        /// 1: Nâng VIP, 2: Đẩy tin, 3: Gia hạn ngày, 4: Đăng tin mới, 5: Gắn nhãn
        /// </summary>
        public int? LoaiDichVu { get; set; }

        public Guid? PhongTroId { get; set; }

        [ForeignKey("PhongTroId")]
        public virtual PhongTro? PhongTro { get; set; }

        [StringLength(50)]
        public string? MaTin { get; set; }

        [StringLength(500)]
        public string? TieuDeTin { get; set; }

        /// <summary>
        /// Số tiền biến động: dương nếu cộng, âm nếu trừ
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal SoTien { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoDuChinhTruoc { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoDuChinhSau { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoDuKmTruoc { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoDuKmSau { get; set; } = 0;

        /// <summary>
        /// 1: Tài khoản chính, 2: Tài khoản KM, 3: Kết hợp
        /// </summary>
        public int NguonTien { get; set; } = 1;

        [Required]
        [StringLength(500)]
        public string NoiDung { get; set; } = string.Empty;

        /// <summary>
        /// 1: Thành công, 0: Thất bại
        /// </summary>
        public int TrangThai { get; set; } = 1;
    }
}
