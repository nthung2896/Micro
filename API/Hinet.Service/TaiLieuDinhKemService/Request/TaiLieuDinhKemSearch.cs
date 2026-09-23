using Hinet.Service.Common;
using Hinet.Service.Dto;

namespace Hinet.Service.TaiLieuDinhKemService.Request
{
    public class TaiLieuDinhKemSearch : SearchBase
    {

        public string? ItemId { get; set; }
        public long? KichThuocMax { get; set; }
        public long? KichThuocMin { get; set; }
        public string? TenTaiLieu { get; set; }
        public string? LoaiTaiLieu { get; set; }
        public string? DinhDangFile { get; set; }
        public bool? IsDonVi { get; set; } = false;


    }
}
