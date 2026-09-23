using Hinet.Service.Dto;

namespace Hinet.Service.XaService.Dto
{
    public class XaSearch : SearchBase
    {
        public string? MaTinh { get; set; }
        public string? MaHuyen { get; set; }
        public string? TenXa { get; set; }
        public string? MaXa { get; set; }
    }
}
