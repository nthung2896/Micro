using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
namespace Hinet.Service.KPI_BoTieuChiDonViService.ViewModels
{
    public class KPI_BoTieuChiDonViCreateVM
    {
        public string? SoQuyetDinh { get; set; }
        public string? TenBoTieuChiDonVi { get; set; }
        public Guid? IdDonVi { get; set; }
        public Guid? IdDot { get; set; }
        public DateTime? ApDungTuNgay { get; set; }
        public DateTime? ApDungToiNgay { get; set; }

    }
}
