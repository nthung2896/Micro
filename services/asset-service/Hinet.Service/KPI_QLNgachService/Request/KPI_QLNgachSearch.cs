using Hinet.Service.Dto;

namespace Hinet.Service.KPI_QLNgachService.Request
{
    public class KPI_QLNgachSearch : SearchBase
    {
        public string? TenNgach { get; set; }
        public string? MaNgach { get; set; }
    }
}
