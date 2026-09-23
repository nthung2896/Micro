using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.KPI_DauRaNhiemVuService.Dto;

namespace Hinet.Service.KPI_NhiemVuService.Dto
{
    public class KPI_NhiemVuDto : KPI_NhiemVu
    {
        public List<string>? SanPhamDauRaList { get; set; }
        public List<KPI_DauRaNhiemVuDto>? DanhSachDauRa { get; set; }
    }
}
