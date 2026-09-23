using Hinet.Service.Dto;

namespace Hinet.Service.TinhService.Request
{
    public class TinhSearch : SearchBase
    {
        public int? STT { get; set; }

        public string? TenTinh { get; set; }

        public string? MaTinh { get; set; }
    }
}
