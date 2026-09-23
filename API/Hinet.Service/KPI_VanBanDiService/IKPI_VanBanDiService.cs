using Hinet.Model.Entities;
using Hinet.Service.KPI_VanBanDiService.Dto;
using Hinet.Service.KPI_VanBanDiService.Request;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using System;
using System.Threading.Tasks;

namespace Hinet.Service.KPI_VanBanDiService
{
    public interface IKPI_VanBanDiService : IService<KPI_VanBanDi>
    {
        Task<PagedList<KPI_VanBanDiDto>> GetData(KPI_VanBanDiSearch search);
        Task<KPI_VanBanDiDto?> GetDto(Guid id);
    }
}
