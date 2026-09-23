using Hinet.Model.Entities;

namespace Hinet.Service.KPI_BoTieuChiChungService.Dto
{
    public class KPI_BoTieuChiChungDto : KPI_BoTieuChiChung
    {
        public string? TenDot { get; set; }
        public string? TenDonVi { get; set; }
        public bool IsAdmin { get; set; }
    }
}
