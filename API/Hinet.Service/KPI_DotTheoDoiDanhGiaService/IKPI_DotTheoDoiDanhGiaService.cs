using Hinet.Model.Entities;
using Hinet.Service.KPI_DotTheoDoiDanhGiaService.Dto;
using Hinet.Service.KPI_DotTheoDoiDanhGiaService.Request;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Dto;

namespace Hinet.Service.KPI_DotTheoDoiDanhGiaService
{
    public interface IKPI_DotTheoDoiDanhGiaService : IService<KPI_DotTheoDoiDanhGia>
    {
        Task<PagedList<KPI_DotTheoDoiDanhGiaDto>> GetData(KPI_DotTheoDoiDanhGiaSearch search);
        Task<KPI_DotTheoDoiDanhGiaDto?> GetDto(Guid id);
        Task<List<DropdownOption>> GetDropdownDotDanhGia(bool activeOnly = false, string? type = null);
        Task<KPI_DotTheoDoiDanhGia> CloneAsync(KPI_DotTheoDoiDanhGiaCloneRequest model);
        Task<CreateCurrentMonthIfMissingResult> CreateCurrentMonthIfMissingAsync(
            DateTime currentTime,
            CancellationToken cancellationToken = default);
    }
}
