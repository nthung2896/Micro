using Hinet.Service.Dto;

namespace Hinet.Service.KPI_DotDanhGia_DonViService.Dto
{
    public class KPI_DotDanhGia_DonViSearch : SearchBase
    {
        public string? IdDotDanhGia { get; set; }
		public string? IdDonVi { get; set; }
		public string? IdBoChiSoNhiemVu { get; set; }
		public string? IdBoTieuChiChung { get; set; }
    }
}
