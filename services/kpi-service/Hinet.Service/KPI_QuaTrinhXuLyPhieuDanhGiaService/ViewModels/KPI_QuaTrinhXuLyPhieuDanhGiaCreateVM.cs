using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService.ViewModels
{
    public class KPI_QuaTrinhXuLyPhieuDanhGiaCreateVM
    {
        [Required]
		public string IdPhieuDanhGia { get; set; }
		[Required]
		public bool IsXuLy { get; set; }
		[Required]
		public string IdNguoiXuLy { get; set; }
		[Required]
		public string IdNguoiGui { get; set; }
		[Required]
		public string TrangThai { get; set; }
		[Required]
		public string GhiChu { get; set; }
    }
}