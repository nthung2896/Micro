using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_VanBanDenService.ViewModels
{
    public class KPI_VanBanDenCreateVM
    {
        [Required]
		public string IdVanBanDongBo { get; set; }
		[Required]
		public string SoVanBan { get; set; }
		[Required]
		public DateTime NgayVanBan { get; set; }
		[Required]
		public string TrichYeu { get; set; }
		[Required]
		public string TrangThai { get; set; }
		[Required]
		public DateTime NgayHoanThanh { get; set; }
    }
}