using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;

namespace Hinet.Service.KPI_BoTieuChiDonViService.Dto
{
    public class KPI_BoTieuChiDonViDto : KPI_BoTieuChiDonVi
    {
        public string? TenDonVi { get; set; }
        public string? TenDot { get; set; }
        public string? CauHinhDiemLanhDaoText { get; set; }
        public bool IsAdmin { get; set; }
    }
}
