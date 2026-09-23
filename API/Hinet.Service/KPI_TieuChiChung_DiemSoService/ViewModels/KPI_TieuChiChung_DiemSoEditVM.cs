using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_TieuChiChung_DiemSoService.ViewModels
{
    public class KPI_TieuChiChung_DiemSoEditVM : KPI_TieuChiChung_DiemSoCreateVM
    {
        public Guid? Id { get; set; }
    }
}