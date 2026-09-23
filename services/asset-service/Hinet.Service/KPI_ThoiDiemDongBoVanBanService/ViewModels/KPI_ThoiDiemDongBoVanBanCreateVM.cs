using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_ThoiDiemDongBoVanBanService.ViewModels
{
    public class KPI_ThoiDiemDongBoVanBanCreateVM
    {
        [Required]
		public long IdVanBan { get; set; }
		[Required]
		public string TypeVanBan { get; set; }
		[Required]
		public DateTime ThoiGianDongBoVanBan { get; set; }
		[Required]
		public bool IsTuNhap { get; set; }
    }
}