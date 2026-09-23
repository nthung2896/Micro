using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_NhomTieuChiService.Request
{
    public class KPI_NhomTieuChiRequest
    {
        public Guid? Id { get; set; }
        [Required]
		public string TenNhomTieuChi { get; set; }
		[Required]
		public string IdDonVi { get; set; }
    }
}