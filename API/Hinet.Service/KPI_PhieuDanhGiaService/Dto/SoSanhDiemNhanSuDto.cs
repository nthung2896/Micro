using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class PhongBanSoSanhDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class PhamViSoSanhNhanSuDto
    {
        // Cấp Cục không được gán phòng ban sẽ so sánh trong phạm vi đơn vị sử dụng.
        public bool TheoDonViSuDung { get; set; }
    }

    public class NhanSuSoSanhDto
    {
        public Guid IdLyLich { get; set; }
        public Guid? UserId { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public Guid PhongBanId { get; set; }
        public string PhongBanName { get; set; } = string.Empty;
    }

    public class SoSanhDiemNhanSuRequest
    {
        public Guid PhongBanNhanSu1Id { get; set; }
        public Guid PhongBanNhanSu2Id { get; set; }
        public Guid IdLyLichNhanSu1 { get; set; }
        public Guid IdLyLichNhanSu2 { get; set; }
        public Guid IdDotDanhGia { get; set; }
    }

    public class SoSanhTieuChiDto
    {
        public string TenTieuChiChung { get; set; } = "Điểm tiêu chí chung";
        public decimal DiemToiDaTieuChiChung { get; set; } = 30;
        public string TenTieuChiKetQua { get; set; } = "Điểm tiêu chí kết quả thực hiện nhiệm vụ";
        public decimal DiemToiDaTieuChiKetQua { get; set; } = 70;
    }

    public class SoSanhDiemNhanSuItemDto
    {
        public Guid IdLyLich { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public Guid PhongBanId { get; set; }
        public string PhongBanName { get; set; } = string.Empty;
        public Guid? IdPhieuDanhGia { get; set; }
        public decimal DiemTieuChiChung { get; set; }
        public decimal DiemTieuChiKetQua { get; set; }
        public decimal DiemBoTieuChi { get; set; }
        public decimal? DiemHeSoLanhDao { get; set; }
        public decimal DiemSoLuong { get; set; }
        public decimal DiemChatLuong { get; set; }
        public decimal DiemTienDo { get; set; }
        public decimal TongDiem { get; set; }
    }

    public class SoSanhDiemNhanSuDto
    {
        public string? TenDotDanhGia { get; set; }
        public bool DuDuLieuSoSanh { get; set; }
        public List<Guid> ThieuDuLieuNhanSuIds { get; set; } = new();
        public SoSanhDiemNhanSuItemDto? NhanSu1 { get; set; }
        public SoSanhDiemNhanSuItemDto? NhanSu2 { get; set; }
        public SoSanhTieuChiDto TieuChi { get; set; } = new();
    }
}
