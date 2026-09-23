using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_NhiemVuService.ViewModels
{
    public class KPI_NhiemVuEditVM : KPI_NhiemVuCreateVM
    {
        public Guid? Id { get; set; }
    }
}