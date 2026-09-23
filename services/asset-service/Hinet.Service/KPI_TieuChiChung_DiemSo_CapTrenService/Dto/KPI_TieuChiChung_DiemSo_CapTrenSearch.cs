using Hinet.Service.Dto;

namespace Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService.Dto
{
    public class KPI_TieuChiChung_DiemSo_CapTrenSearch : SearchBase
    {
        public string? Id_TieuChiChung_DiemSo { get; set; }
        public string? VaiTroDanhGia { get; set; }
        public decimal? Diem { get; set; }
        public string? GhiChu { get; set; }
    }
}
