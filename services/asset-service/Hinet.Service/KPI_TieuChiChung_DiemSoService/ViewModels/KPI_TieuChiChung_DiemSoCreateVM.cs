using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_TieuChiChung_DiemSoService.ViewModels
{
    public class KPI_TieuChiChung_DiemSoCreateVM
    {
        [Required]
		public string IdTieuChiChung { get; set; }
		[Required]
		public string IdLyLich { get; set; }
		[Required]
		public string IdDotDanhGia { get; set; }
		[Required]
		public decimal DiemTuCham { get; set; }
    }
}