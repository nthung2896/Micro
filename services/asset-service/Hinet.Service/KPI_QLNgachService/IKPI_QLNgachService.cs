using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_QLNgachService.Dto;
using Hinet.Service.KPI_QLNgachService.Request;
using Hinet.Service.Dto;

namespace Hinet.Service.KPI_QLNgachService
{
    public interface IKPI_QLNgachService : IService<KPI_QLNgach>
    {
        Task<PagedList<KPI_QLNgachDto>> GetData(KPI_QLNgachSearch search);
        Task<KPI_QLNgachDto?> GetDto(Guid id);
    }
}
