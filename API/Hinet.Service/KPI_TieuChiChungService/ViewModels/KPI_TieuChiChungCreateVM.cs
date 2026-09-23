using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_TieuChiChungService.ViewModels
{
    public class KPI_TieuChiChungCreateVM
    {
        [Required]
		public string Ten { get; set; }
		public Guid? ParentId { get; set; }
		[Required]
		public decimal MyProperty { get; set; }
		public int? Priority { get; set; }
    }
}