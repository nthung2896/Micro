using Hinet.Service.Dto;

namespace Hinet.Service.HuyenService.Request
{
    public class HuyenSearch : SearchBase
    {
        public int? LoaiHuyen { get; set; }
        public string? TenHuyen { get; set; }
        public string? Ma { get; set; }
        public string? MaTinh { get; set; }
        public string? MaTinhMoi { get; set; }

        public string? TenTinh { get; set; }
    }
}
