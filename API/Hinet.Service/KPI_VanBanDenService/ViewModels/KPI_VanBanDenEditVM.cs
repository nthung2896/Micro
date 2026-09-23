using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_VanBanDenService.ViewModels
{
    public class KPI_VanBanDenEditVM : KPI_VanBanDenCreateVM
    {
        public Guid? Id { get; set; }
    }
}