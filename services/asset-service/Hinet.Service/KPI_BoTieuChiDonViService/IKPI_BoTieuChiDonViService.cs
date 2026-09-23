using Hinet.Model.Entities;
using Hinet.Service.KPI_BoTieuChiDonViService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_BoTieuChiDonViService
{
    public interface IKPI_BoTieuChiDonViService : IService<KPI_BoTieuChiDonVi>
    {
        Task<PagedList<KPI_BoTieuChiDonViDto>> GetData(KPI_BoTieuChiDonViSearch search);
        Task<KPI_BoTieuChiDonViDto?> GetDto(Guid id);
        Task SetActiveBoTieuChiDonViAsync(Guid activeId, Guid idDonVi);
    }
}
