using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Dto;
using Hinet.Service.KPI_TieuChiChung_DiemSoService.Dto;

namespace Hinet.Service.KPI_TieuChiChung_DiemSoService
{
    public interface IKPI_TieuChiChung_DiemSoService : IService<KPI_TieuChiChung_DiemSo>
    {
        Task<PagedList<KPI_TieuChiChung_DiemSoDto>> GetData(KPI_TieuChiChung_DiemSoSearch search);
        Task<KPI_TieuChiChung_DiemSoDto?> GetDto(Guid id);
        Task<KPI_TieuChiChung_DiemSoKeThuaResponseDto> GetDanhSachKeThua(Guid idDotDanhGia, Guid currentUserId);
        Task<KPI_TongHopTieuChiChungDto> GetTongHopTieuChi(KPI_TongHopTieuChiChungSearchDto search);
        Task<KPI_TongHopToanCucDto> GetTongHopToanCuc(KPI_TongHopTieuChiChungSearchDto search);
        Task<List<KPI_ThongKeQuyDonViDto>> GetChartThongKeQuyToanCuc(int quy, int nam, Guid? donViSuDungId = null, Guid? currentUserId = null);
    }
}
