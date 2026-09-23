using Hinet.Service.Dto;

namespace Hinet.Service.KPI_DauRaNhiemVuService.Dto
{
    public class KPI_DauRaNhiemVuSearch : SearchBase
    {
        public Guid? IdNhiemVu { get; set; }
		public Guid? IdThoiDiemDongBoVanBan { get; set; }
		public Guid? IdDotDanhGia { get; set; }
    }
}
