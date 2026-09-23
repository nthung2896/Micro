using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_DauRaNhiemVuService.ViewModels
{
    public class KPI_DauRaNhiemVuCreateVM
    {
        [Required]
		public string IdNhiemVu { get; set; }
		[Required]
		public string IdThoiDiemDongBoVanBan { get; set; }
		[Required]
		public string IdDotDanhGia { get; set; }
    }
}