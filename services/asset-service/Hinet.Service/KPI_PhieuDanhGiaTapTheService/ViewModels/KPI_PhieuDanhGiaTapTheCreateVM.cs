using System;

namespace Hinet.Service.KPI_PhieuDanhGiaTapTheService.ViewModels
{
    public class KPI_PhieuDanhGiaTapTheCreateVM
    {
        public Guid? IdDotDanhGia { get; set; }
        public Guid? DonVi { get; set; }
        public int? Luong { get; set; }
        public string? PhongBan { get; set; }
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemThucHienNhiemVu { get; set; }
        public decimal? TongDiem { get; set; }
        public int? ChatLuongTuDanhGia { get; set; }
        public int? ChatLuongCapTrenDanhGia { get; set; }
        public string? TrangThai { get; set; }
    }
}