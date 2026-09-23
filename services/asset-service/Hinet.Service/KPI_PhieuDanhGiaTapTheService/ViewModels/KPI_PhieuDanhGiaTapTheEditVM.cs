using System;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.KPI_PhieuDanhGiaTapTheService.ViewModels
{
    public class KPI_PhieuDanhGiaTapTheEditVM : KPI_PhieuDanhGiaTapTheCreateVM
    {
        [Required]
        public Guid Id { get; set; }
    }
}