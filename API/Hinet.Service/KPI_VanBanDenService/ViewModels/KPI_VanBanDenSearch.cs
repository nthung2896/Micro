using Hinet.Service.Dto;

namespace Hinet.Service.KPI_VanBanDenService.Dto
{
    public class KPI_VanBanDenSearch : SearchBase
    {
        public string? IdVanBanDongBo { get; set; }
		public string? SoVanBan { get; set; }
		public DateTime? NgayVanBanFrom { get; set; }
		public DateTime? NgayVanBanTo { get; set; }
		public string? TrichYeu { get; set; }
		public string? TrangThai { get; set; }
		public DateTime? NgayHoanThanhFrom { get; set; }
		public DateTime? NgayHoanThanhTo { get; set; }
    }
}
