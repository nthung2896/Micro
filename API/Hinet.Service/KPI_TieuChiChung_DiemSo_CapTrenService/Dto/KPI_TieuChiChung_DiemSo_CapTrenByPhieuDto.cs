using System;

namespace Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService.Dto
{
    public class KPI_TieuChiChung_DiemSo_CapTrenByPhieuDto
    {
        public Guid IdTieuChiChungDiemSo { get; set; }
        public Guid IdTieuChiChung { get; set; }
        public Guid? IdPhieuDanhGia { get; set; }
        public Guid? IdLyLich { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public decimal? DiemTuCham { get; set; }
        public decimal? DiemCapTren { get; set; }
        public decimal? DiemToiDa { get; set; }
        public string? GhiChu { get; set; }
        public Dictionary<string, decimal?> DiemTheoVaiTro { get; set; } = new();
    }

    public class KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse
    {
        public List<KPI_TieuChiChung_DiemSo_CapTrenByPhieuDto> Items { get; set; } = new();
        public string? VaiTroDanhGia { get; set; }
        public bool CanEdit { get; set; }
        public decimal TongDiemCapTren { get; set; }
        public bool IsComplete { get; set; }
        public List<string> DanhSachVaiTroDaDanhGia { get; set; } = new();
        public Dictionary<string, decimal> TongDiemTheoVaiTro { get; set; } = new();
    }
}
