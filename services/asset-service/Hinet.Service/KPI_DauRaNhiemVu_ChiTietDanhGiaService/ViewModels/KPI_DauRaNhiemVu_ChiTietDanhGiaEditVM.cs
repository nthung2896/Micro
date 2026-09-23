using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService.ViewModels
{
    public class KPI_DauRaNhiemVu_ChiTietDanhGiaEditVM : KPI_DauRaNhiemVu_ChiTietDanhGiaCreateVM
    {
        public Guid? Id { get; set; }
    }
}