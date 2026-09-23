using Hinet.Model.Entities;
using Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService.Dto;
using Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService.ViewModels;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService
{
    public interface IKPI_DauRaNhiemVu_ChiTietDanhGiaService : IService<KPI_DauRaNhiemVu_ChiTietDanhGia>
    {
        Task<PagedList<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>> GetData(KPI_DauRaNhiemVu_ChiTietDanhGiaSearch search);
        Task<KPI_DauRaNhiemVu_ChiTietDanhGiaDto?> GetDto(Guid id);
        Task<List<KPI_DauRaNhiemVu_ChiTietDanhGiaDto>> GetByPhieu(Guid idPhieuDanhGia);
        Task SaveBatch(Guid idPhieuDanhGia, string vaiTroDanhGia, Guid nguoiDanhGiaId, List<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateVM> items);
    }
}
