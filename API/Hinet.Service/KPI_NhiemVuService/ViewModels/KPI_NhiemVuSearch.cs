using Hinet.Service.Dto;

namespace Hinet.Service.KPI_NhiemVuService.Dto
{
    public class KPI_NhiemVuSearch : SearchBase
    {
        public string? IdNhiemVuTraVe { get; set; }
		public string? TenNhiemVuDayDu { get; set; }
		public string? TenNhiemVuRutGon { get; set; }
		public string? MaLoaiNhiemVu { get; set; }
		public string? TenLoaiNhiemVu { get; set; }
		public string? NhiemVuTrongTam { get; set; }
		public DateTime? ThoiHanFrom { get; set; }
		public DateTime? ThoiHanTo { get; set; }
		public DateTime? NgayHoanThanhFrom { get; set; }
		public DateTime? NgayHoanThanhTo { get; set; }
		public DateTime? NgayVanBanFrom { get; set; }
		public DateTime? NgayVanBanTo { get; set; }
		public string? MaNhiemVuCha { get; set; }
		public string? LoaiHanXuLy { get; set; }
		public string? Email { get; set; }
		public string? IdDotTheoDoiDanhGia { get; set; }
		public string? IdLyLich { get; set; }
		public string? IdPhongBan { get; set; }
		public string? TenPhongBan { get; set; }
		public string? IdNguoiXuLy { get; set; }
		public string? TenNguoiXuLy { get; set; }
		public string? IdLinhVuc { get; set; }
		public string? TenLinhVuc { get; set; }
		public int? SoLanCapNhatTienDo { get; set; }
		public bool? IsHoanThanh { get; set; }
		public bool? IsDaDuyet { get; set; }
		public string? Status { get; set; }
		public string? KetQuaXuLyMoiNhat { get; set; }
		public string? KetQuaTuXepLoai { get; set; }
		public string? KetQuaPhoPhongXepLoai { get; set; }
		public string? KetQuaLanhDaoXepLoai { get; set; }
		public string? Type { get; set; }
		public string? TypeCaNhanTruongBan { get; set; }
		public string? EmailsNguoiThucHien { get; set; }
		public DateTime? TimeDongBoFrom { get; set; }
		public DateTime? TimeDongBoTo { get; set; }
    }
}
