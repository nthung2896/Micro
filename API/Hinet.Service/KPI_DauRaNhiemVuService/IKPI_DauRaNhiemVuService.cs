using Hinet.Model.Entities;
using Hinet.Service.KPI_DauRaNhiemVuService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_DauRaNhiemVuService
{
    public interface IKPI_DauRaNhiemVuService : IService<KPI_DauRaNhiemVu>
    {
        Task<PagedList<KPI_DauRaNhiemVuDto>> GetData(KPI_DauRaNhiemVuSearch search);
        Task<KPI_DauRaNhiemVuDto?> GetDto(Guid id);
    }
}
