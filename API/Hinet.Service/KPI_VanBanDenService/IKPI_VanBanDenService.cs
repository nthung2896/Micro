using Hinet.Model.Entities;
using Hinet.Service.KPI_VanBanDenService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_VanBanDenService
{
    public interface IKPI_VanBanDenService : IService<KPI_VanBanDen>
    {
        Task<PagedList<KPI_VanBanDenDto>> GetData(KPI_VanBanDenSearch search);
        Task<KPI_VanBanDenDto?> GetDto(Guid id);
    }
}
