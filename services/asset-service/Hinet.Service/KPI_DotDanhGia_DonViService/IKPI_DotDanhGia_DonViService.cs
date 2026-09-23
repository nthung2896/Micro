using Hinet.Model.Entities;
using Hinet.Service.KPI_DotDanhGia_DonViService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_DotDanhGia_DonViService
{
    public interface IKPI_DotDanhGia_DonViService : IService<KPI_DotDanhGia_DonVi>
    {
        Task<PagedList<KPI_DotDanhGia_DonViDto>> GetData(KPI_DotDanhGia_DonViSearch search);
        Task<KPI_DotDanhGia_DonViDto?> GetDto(Guid id);
    }
}
