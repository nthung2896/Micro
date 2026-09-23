using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_NhiemVuService.ViewModels
{
    public class KPI_NhiemVuCreateVM
    {
        [Required]
		public string IdNhiemVuTraVe { get; set; }
		[Required]
		public string TenNhiemVuDayDu { get; set; }
		[Required]
		public string TenNhiemVuRutGon { get; set; }
		[Required]
		public string MaLoaiNhiemVu { get; set; }
		[Required]
		public string TenLoaiNhiemVu { get; set; }
		[Required]
		public string NhiemVuTrongTam { get; set; }
		[Required]
		public DateTime ThoiHan { get; set; }
		[Required]
		public DateTime NgayHoanThanh { get; set; }
		[Required]
		public DateTime NgayVanBan { get; set; }
		[Required]
		public string MaNhiemVuCha { get; set; }
		[Required]
		public string LoaiHanXuLy { get; set; }
		[Required]
		public string Email { get; set; }
		[Required]
		public string IdDotTheoDoiDanhGia { get; set; }
		[Required]
		public string IdLyLich { get; set; }
		[Required]
		public string IdPhongBan { get; set; }
		[Required]
		public string TenPhongBan { get; set; }
		[Required]
		public string IdNguoiXuLy { get; set; }
		[Required]
		public string TenNguoiXuLy { get; set; }
		[Required]
		public string IdLinhVuc { get; set; }
		[Required]
		public string TenLinhVuc { get; set; }
		[Required]
		public int SoLanCapNhatTienDo { get; set; }
		[Required]
		public bool IsHoanThanh { get; set; }
		[Required]
		public bool IsDaDuyet { get; set; }
		[Required]
		public string Status { get; set; }
		[Required]
		public string KetQuaXuLyMoiNhat { get; set; }
		[Required]
		public string KetQuaTuXepLoai { get; set; }
		[Required]
		public string KetQuaPhoPhongXepLoai { get; set; }
		[Required]
		public string KetQuaLanhDaoXepLoai { get; set; }
		[Required]
		public string Type { get; set; }
		[Required]
		public string TypeCaNhanTruongBan { get; set; }
		[Required]
		public string EmailsNguoiThucHien { get; set; }
		[Required]
		public DateTime TimeDongBo { get; set; }
    }
}