using Hinet.Model.Entities;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_KetQuaThucHienNhiemVuService.Dto;
using Hinet.Service.KPI_NhiemVuService.Dto;

namespace Hinet.Service.KPI_KetQuaThucHienNhiemVuService
{
    public interface IKPI_KetQuaThucHienNhiemVuService : IService<KPI_KetQuaThucHienNhiemVu>
    {
        Task SaveKetQuaThucHien(SaveKetQuaThucHienNhiemVuDto model);
        Task<KPI_KetQuaThucHienNhiemVu?> GetKetQuaThucHien(Guid? idPhieuDanhGia, Guid? idDotDanhGia, Guid? idLyLich);
        Task<HeSoLanhDaoApDungDto> GetHeSoLanhDaoApDung(Guid? idPhieuDanhGia, Guid? idDotDanhGia, Guid? idLyLich);
    }
}
