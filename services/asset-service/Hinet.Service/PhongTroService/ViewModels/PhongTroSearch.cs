using Hinet.Service.Dto;

namespace Hinet.Service.PhongTroService.Dto
{
    public class PhongTroSearch : SearchBase
    {
        public int? TrangThai { get; set; }
		public int? LuotXem { get; set; }
		public int? GoiTin { get; set; }
		public int? SoLuotDayTin { get; set; }
		public int? TrangThaiDuyet { get; set; }
		public bool? IsNoiBat { get; set; }
		public string? TieuDe { get; set; }
    }
}
