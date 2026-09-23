using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_DotDanhGia_DonViService.ViewModels
{
    public class KPI_DotDanhGia_DonViEditVM : KPI_DotDanhGia_DonViCreateVM
    {
        public Guid? Id { get; set; }
    }
}