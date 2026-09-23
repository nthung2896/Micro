using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_CauHinhCongThucNhiemVuService.Dto;
using System;
using System.Threading.Tasks;

namespace Hinet.Service.KPI_CauHinhCongThucNhiemVuService
{
    public interface IKPI_CauHinhCongThucNhiemVuService : IService<KPI_CauHinhCongThucNhiemVu>
    {
        Task<PagedList<KPI_CauHinhCongThucNhiemVuDto>> GetData(KPI_CauHinhCongThucNhiemVuSearch search);
        Task<KPI_CauHinhCongThucNhiemVuDto?> GetDto(Guid id);
    }
}
