using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;

namespace Hinet.Service.KPI_TieuChiChungService.Dto
{
    public class KPI_TieuChiChungDto : KPI_TieuChiChung
    {
        public string? TenBoTieuChiChung { get; set; }
        public string? TenParent { get; set; }
    }
}
