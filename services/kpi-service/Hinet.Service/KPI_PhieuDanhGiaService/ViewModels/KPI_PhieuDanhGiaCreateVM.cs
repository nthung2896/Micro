using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_PhieuDanhGiaService.ViewModels
{
    public class KPI_PhieuDanhGiaCreateVM
    {
        [Required]
        public string IdLyLich { get; set; }
        [Required]
        public string DonVi { get; set; }
        [Required]
        public string PhongBan { get; set; }
        [Required]
        public decimal DiemTieuChiChung { get; set; }
        [Required]
        public decimal DiemThucHienNhiemVu { get; set; }
        [Required]
        public decimal TongDiem { get; set; }
        [Required]
        public string UuDiem { get; set; }
        [Required]
        public string HanChe { get; set; }
        [Required]
        public string YKienNhanXet { get; set; }
    }
}
