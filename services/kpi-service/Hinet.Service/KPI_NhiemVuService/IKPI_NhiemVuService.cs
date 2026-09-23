using Hinet.Model.Entities;
using Hinet.Service.KPI_NhiemVuService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_NhiemVuService
{
    public interface IKPI_NhiemVuService : IService<KPI_NhiemVu>
    {
        Task<PagedList<KPI_NhiemVuDto>> GetData(KPI_NhiemVuSearch search);
        Task<KPI_NhiemVuDto?> GetDto(Guid id);
        Task<List<KPI_NhiemVuDto>> GetListByTypeAndLyLich(Guid idLyLich, string type, Guid idDotTheoDoiDanhGia);
        Task<KPI_NhiemVuSaveWithAttachmentsResponse> SaveWithAttachmentsAsync(
            KPI_NhiemVuSaveWithAttachmentsRequest request,
            Guid? userId);
        Task DeleteWithAttachmentsAsync(Guid id, Guid? userId);
        Task<KPI_NhiemVu> SaveNhiemVuTCCBAsync(ViewModels.SaveNhiemVuTCCBVM model, Guid? userId);
        Task DeleteNhiemVuTCCBAsync(Guid id, Guid? userId);
    }
}
