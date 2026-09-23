using System;

namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class ThongKeDiemNhanSuDto
    {
        public Guid IdLyLich { get; set; }
        public Guid? UserId { get; set; }
        public string? HoTen { get; set; }
        public string? ChucVuCode { get; set; }
        public string? ChucVuName { get; set; }
        public Guid IdPhieuDanhGia { get; set; }
        public Guid IdDotDanhGia { get; set; }
        public string? TenDotDanhGia { get; set; }
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemTieuChiKetQua { get; set; }
        public decimal? TongDiem { get; set; }
        public bool DuDiemNhiemVuTheoVaiTro { get; set; } = true;
        public int SoDauRaThieuDiem { get; set; }
    }
}
