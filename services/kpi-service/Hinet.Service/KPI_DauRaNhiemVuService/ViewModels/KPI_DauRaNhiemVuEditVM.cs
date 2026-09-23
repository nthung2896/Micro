using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_DauRaNhiemVuService.ViewModels
{
    public class KPI_DauRaNhiemVuEditVM : KPI_DauRaNhiemVuCreateVM
    {
        public Guid? Id { get; set; }
    }
}