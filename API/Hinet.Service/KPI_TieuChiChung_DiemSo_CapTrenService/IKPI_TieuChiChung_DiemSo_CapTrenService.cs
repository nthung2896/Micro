using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService.Dto;
using Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService.ViewModels;

namespace Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService
{
    public interface IKPI_TieuChiChung_DiemSo_CapTrenService : IService<KPI_TieuChiChung_DiemSo_CapTren>
    {
        Task<PagedList<KPI_TieuChiChung_DiemSo_CapTrenDto>> GetData(KPI_TieuChiChung_DiemSo_CapTrenSearch search);
        Task<KPI_TieuChiChung_DiemSo_CapTrenDto?> GetDto(Guid id);
        Task<bool> CanEditRecord(Guid id, Guid? currentUserId);
        Task<bool> CanEditPersonalScore(Guid idTieuChiChungDiemSo, Guid? currentUserId);
        Task<KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse> GetByPhieu(Guid idPhieuDanhGia, Guid? currentUserId);
        Task SaveBatch(KPI_TieuChiChung_DiemSo_CapTrenSaveBatchVM request, Guid? currentUserId);
    }
}
