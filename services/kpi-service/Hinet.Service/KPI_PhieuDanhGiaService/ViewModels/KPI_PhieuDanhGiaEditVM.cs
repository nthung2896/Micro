using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_PhieuDanhGiaService.ViewModels
{
    public class KPI_PhieuDanhGiaEditVM : KPI_PhieuDanhGiaCreateVM
    {
        public Guid? Id { get; set; }
    }
}