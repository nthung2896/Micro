using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_BoTieuChiDonViService.ViewModels
{
    public class KPI_BoTieuChiDonViEditVM : KPI_BoTieuChiDonViCreateVM
    {
        public Guid? Id { get; set; }
    }
}