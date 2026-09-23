using Hinet.Service.Dto;

namespace Hinet.Service.KPI_NhomTieuChiService.Request
{
    public class KPI_NhomTieuChiSearch : SearchBase
    {
        public Guid? IdBoTieuChiDonVi { get; set; }
        public string? Keyword { get; set; }
        public string? TenNhomTieuChi { get; set; }
        public string? CongViecChiTiet { get; set; }
        public string? SanPhamDauRa { get; set; }
        public string? PhanNhom { get; set; }
        public Guid? IdDonVi { get; set; }
        public int? Level { get; set; }
        public bool? IsElastic { get; set; }
        public Guid? ParentID { get; set; }
    }
}
