using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_TieuChiChungService.ViewModels
{
    public class KPI_TieuChiChungEditVM : KPI_TieuChiChungCreateVM
    {
        public Guid? Id { get; set; }
    }
}