using Hinet.Service.Dto;

namespace Hinet.Service.KPI_TieuChiChung_DiemSoService.Dto
{
    public class KPI_TieuChiChung_DiemSoSearch : SearchBase
    {
        public string? IdTieuChiChung { get; set; }
		public string? IdLyLich { get; set; }
		public string? IdDotDanhGia { get; set; }
		public Guid? IdPhieuDanhGia { get; set; }
		public decimal? DiemTuCham { get; set; }
    }
}
