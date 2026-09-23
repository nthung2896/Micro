using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_NhomTieuChiService.Dto;
using Hinet.Service.KPI_NhomTieuChiService.Request;

namespace Hinet.Service.KPI_NhomTieuChiService
{
    public interface IKPI_NhomTieuChiService : IService<KPI_NhomTieuChi>
    {
        Task<PagedList<KPI_NhomTieuChiDto>> GetData(KPI_NhomTieuChiSearch search);
        Task<PagedList<KPI_NhomTieuChiDto>> GetDataElasticExact(KPI_NhomTieuChiSearch search);
        Task<List<Guid>> GetDeXuatTieuChiElastic(string? tenNhiemVu, string? tenSanPham, Guid? idBoTieuChiDonVi, List<Guid>? relatedIds = null);
        Task<List<KPI_NhomTieuChiDto>> GetTop3DeXuatTieuChiElastic(string? tenNhiemVu, string? tenSanPham, Guid? idBoTieuChiDonVi, List<Guid>? relatedIds = null);
        Task<KPI_NhomTieuChiDto?> GetDto(Guid id);
        Task<List<KPI_NhomTieuChiDto>> GetTreeDataForDot(Guid idDot, Guid? idLyLich, Guid? idPhieuDanhGia);
        Task<bool> SyncToElastic(Guid? idBoTieuChiDonVi = null);
    }
}
