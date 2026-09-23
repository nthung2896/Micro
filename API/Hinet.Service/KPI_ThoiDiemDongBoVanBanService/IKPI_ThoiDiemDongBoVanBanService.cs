using Hinet.Model.Entities;
using Hinet.Service.KPI_ThoiDiemDongBoVanBanService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_ThoiDiemDongBoVanBanService
{
    public interface IKPI_ThoiDiemDongBoVanBanService : IService<KPI_ThoiDiemDongBoVanBan>
    {
        Task<PagedList<KPI_ThoiDiemDongBoVanBanDto>> GetData(KPI_ThoiDiemDongBoVanBanSearch search);
        Task<KPI_ThoiDiemDongBoVanBanDto?> GetDto(Guid id);
    }
}
