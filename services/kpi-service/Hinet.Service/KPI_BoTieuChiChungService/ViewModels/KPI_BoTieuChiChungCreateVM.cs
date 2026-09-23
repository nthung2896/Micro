using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System;
namespace Hinet.Service.KPI_BoTieuChiChungService.ViewModels
{
    public class KPI_BoTieuChiChungCreateVM
    {
        public string? SoQuyetDinh { get; set; }
        public string? TenBoTieuChiDonVi { get; set; }
        [Required]
        [RegularExpression("^(CaNhan|TapThe)$", ErrorMessage = "Loại bộ tiêu chí chỉ được phép là CaNhan hoặc TapThe.")]
        public string? Type { get; set; }
        public Guid? IdDonVi { get; set; }
        public Guid? IdDot { get; set; }
        public DateTime? NgayQuyetDinh { get; set; }
        public DateTime? ApDungTuNgay { get; set; }
        public DateTime? ApDungToiNgay { get; set; }
        public bool? IsActive { get; set; }
    }
}
