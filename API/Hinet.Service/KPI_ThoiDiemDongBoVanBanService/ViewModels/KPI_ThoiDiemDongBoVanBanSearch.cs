using Hinet.Service.Dto;

namespace Hinet.Service.KPI_ThoiDiemDongBoVanBanService.Dto
{
    public class KPI_ThoiDiemDongBoVanBanSearch : SearchBase
    {
        public long? IdVanBan { get; set; }
		public string? TypeVanBan { get; set; }
		public DateTime? ThoiGianDongBoVanBanFrom { get; set; }
		public DateTime? ThoiGianDongBoVanBanTo { get; set; }
		public bool? IsTuNhap { get; set; }
    }
}
