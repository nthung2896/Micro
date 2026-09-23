using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_ThoiDiemDongBoVanBanService.ViewModels
{
    public class KPI_ThoiDiemDongBoVanBanEditVM : KPI_ThoiDiemDongBoVanBanCreateVM
    {
        public Guid? Id { get; set; }
    }
}