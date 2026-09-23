using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService.ViewModels
{
    public class KPI_QuaTrinhXuLyPhieuDanhGiaEditVM : KPI_QuaTrinhXuLyPhieuDanhGiaCreateVM
    {
        public Guid? Id { get; set; }
    }
}