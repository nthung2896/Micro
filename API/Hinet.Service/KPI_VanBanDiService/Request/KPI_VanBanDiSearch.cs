using Hinet.Service.Dto;

namespace Hinet.Service.KPI_VanBanDiService.Request
{
    public class KPI_VanBanDiSearch : SearchBase
    {
        public string? LoaiVanBan { get; set; }
        public string? SoHieu { get; set; }
        public string? TrichYeu { get; set; }
    }
}
