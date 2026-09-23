using Hinet.Service.Dto;
using System;
namespace Hinet.Service.KPI_BoTieuChiChungService.ViewModels
{
    public class KPI_BoTieuChiChungSearch : SearchBase
    {
        public string? SoQuyetDinh { get; set; }
        public string? TenBoTieuChiDonVi { get; set; }
        public string? Type { get; set; }
        public Guid? IdDonVi { get; set; }
        public Guid? IdDot { get; set; }
        public bool? IsActive { get; set; }
    }
}
