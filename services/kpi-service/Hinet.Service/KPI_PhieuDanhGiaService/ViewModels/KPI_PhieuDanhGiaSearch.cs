using Hinet.Service.Dto;

namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class KPI_PhieuDanhGiaSearch : SearchBase
    {
        public Guid? IdLyLich { get; set; }
        public string? IdDotDanhGia { get; set; }
        public string? DonVi { get; set; }
        public string? PhongBan { get; set; }
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemThucHienNhiemVu { get; set; }
        public decimal? TongDiem { get; set; }
        public string? UuDiem { get; set; }
        public string? HanChe { get; set; }
        public string? YKienNhanXet { get; set; }

        public int? Quy { get; set; }
        public int? Thang { get; set; }
        public int? Nam { get; set; }

        public string? TrangThai { get; set; }
        public Guid? IdNguoiXuLy { get; set; }
        public bool? IsXuLy { get; set; }
        public bool? IsKhacHoanThanh { get; set; }
    }
}
