using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SharedKernel.Entities;

namespace RoomService.Entities
{
    [Table("Room_BangGia")]
    public class Room_BangGia : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string ThuocTinh { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LoaiTin { get; set; } = string.Empty;

        [StringLength(50)]
        public string? MaMau { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaTin { get; set; }

        public bool? IsTuDongDuyet { get; set; } = false;
        public bool? IsDuyTriThem10Ngay { get; set; } = false;
        public bool IsHienThiNutGoi { get; set; } = false;
    }

    [Table("Room_CauHinhKhuyenMaiNap")]
    public class Room_CauHinhKhuyenMaiNap : BaseEntity
    {
        [Required]
        [StringLength(250)]
        public string TenChuongTrinh { get; set; } = string.Empty;

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

    [Table("Room_ViTien")]
    public class Room_ViTien : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoDuChinh { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoDuKhuyenMai { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TongNap { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TongChi { get; set; } = 0;

        public int HangThanhVien { get; set; } = 1;
        public int TrangThai { get; set; } = 1;

        [NotMapped]
        public decimal TongSoDu => SoDuChinh + SoDuKhuyenMai;
    }

    [Table("Room_PhongTro")]
    public class PhongTro : BaseEntity
    {
        [Required]
        [StringLength(250)]
        public string TieuDe { get; set; } = string.Empty;

        public string? MoTa { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal GiaThue { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DienTich { get; set; } = 0;

        public string? DiaChiChiTiet { get; set; }
        public Guid? TinhId { get; set; }
        public Guid? HuyenId { get; set; }
        public Guid? XaId { get; set; }
        public Guid UserId { get; set; }
        public int TrangThai { get; set; } = 1; // 1: Chờ duyệt, 2: Đã duyệt, 3: Hết hạn
    }
}
