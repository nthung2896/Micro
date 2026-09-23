using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.TaiLieuDinhKemService.Dto;

namespace Hinet.Service.KPI_DauRaNhiemVuService.Dto
{
    public class KPI_DauRaNhiemVuDto : KPI_DauRaNhiemVu
    {
        public List<TaiLieuDinhKemDto> TaiLieuDinhKem { get; set; } = new();
    }
}
