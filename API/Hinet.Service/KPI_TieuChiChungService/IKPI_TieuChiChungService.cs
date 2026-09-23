using Hinet.Model.Entities;
using Hinet.Service.KPI_TieuChiChungService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_TieuChiChungService
{
    public interface IKPI_TieuChiChungService : IService<KPI_TieuChiChung>
    {
        Task<PagedList<KPI_TieuChiChungDto>> GetData(KPI_TieuChiChungSearch search);
        Task<KPI_TieuChiChungDto?> GetDto(Guid id);
        /// <summary>
        /// Xác định bộ tiêu chí chung áp dụng cho một đợt và một cán bộ.
        /// Hàm này là nguồn dùng chung cho các màn hình cần cùng quy tắc chọn bộ tiêu chí.
        /// </summary>
        Task<KPI_BoTieuChiChungApDungDto?> GetBoTieuChiChungApDungForDot(
            Guid idDot,
            Guid? idLyLich,
            Guid? idPhieuDanhGia,
            Guid? idDonVi = null);

        /// <summary>
        /// Lấy cây tiêu chí của một bộ tiêu chí chung đã xác định.
        /// </summary>
        Task<List<KPI_TieuChiChungTreeDto>> GetTreeDataForBoTieuChiChung(
            Guid idBoTieuChiChung,
            IReadOnlyDictionary<Guid, decimal?>? diemTuChamTheoTieuChi = null);
        Task<List<KPI_TieuChiChungTreeDto>> GetTreeDataForDot(Guid idDot, Guid? idLyLich, Guid? idPhieuDanhGia, Guid? idDonVi = null);
    }
}
