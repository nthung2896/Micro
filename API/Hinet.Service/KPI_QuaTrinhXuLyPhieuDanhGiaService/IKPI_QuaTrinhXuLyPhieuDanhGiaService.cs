using Hinet.Model.Entities;
using Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService
{
    public interface IKPI_QuaTrinhXuLyPhieuDanhGiaService : IService<KPI_QuaTrinhXuLyPhieuDanhGia>
    {
        Task<PagedList<KPI_QuaTrinhXuLyPhieuDanhGiaDto>> GetData(KPI_QuaTrinhXuLyPhieuDanhGiaSearch search);
        Task<KPI_QuaTrinhXuLyPhieuDanhGiaDto?> GetDto(Guid id);
    }
}
