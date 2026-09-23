using System;

namespace Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService.ViewModels
{
    public class KPI_TieuChiChung_DiemSo_CapTrenCreateVM
    {
        public Guid Id_TieuChiChung_DiemSo { get; set; }
        public Guid? IdPhieuDanhGia { get; set; }
        public Guid? IdLyLich { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public string? VaiTroDanhGia { get; set; }
        public decimal? Diem { get; set; }
        public string? GhiChu { get; set; }
    }
}
