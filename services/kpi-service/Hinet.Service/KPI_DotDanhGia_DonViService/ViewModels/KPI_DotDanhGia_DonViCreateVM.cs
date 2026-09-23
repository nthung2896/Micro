using System;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.KPI_DotDanhGia_DonViService.ViewModels
{
    public class KPI_DotDanhGia_DonViCreateVM
    {
        [Required]
        public Guid IdDotDanhGia { get; set; }
        [Required]
        public Guid IdDonVi { get; set; }
        public Guid? IdBoChiSoNhiemVu { get; set; }
        public Guid? IdBoTieuChiChung { get; set; }
    }
}