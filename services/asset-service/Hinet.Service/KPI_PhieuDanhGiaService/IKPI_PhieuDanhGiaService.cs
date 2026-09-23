using Hinet.Model.Entities;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.KPI_PhieuDanhGiaService
{
    public interface IKPI_PhieuDanhGiaService : IService<KPI_PhieuDanhGia>
    {
        Task<PagedList<KPI_PhieuDanhGiaDto>> GetData(KPI_PhieuDanhGiaSearch search);
        Task<KPI_PhieuDanhGiaDto?> GetDto(Guid id);
        Task<PagedList<DotDanhGiaWithPhieuDto>> GetDotDanhGiaWithPhieu(Guid userId, KPI_PhieuDanhGiaSearch search);
        Task<PagedList<DotDanhGiaWithPhieuDto>> GetDanhSachNhanSuDanhGia(Guid userId, KPI_PhieuDanhGiaSearch search);
        Task<List<ThongKePhieuDanhGiaTheoThangDto>> GetThongKePhieuDanhGiaTheoThang(Guid userId, KPI_PhieuDanhGiaSearch search);
        Task<List<ThongKeDiemNhanSuDto>> ThongKeDiemNhanSuTheoChucVu(string chucVuCode, Guid idDotDanhGia, string? vaiTroDanhGia = null);
        Task<PhamViSoSanhNhanSuDto> GetPhamViSoSanhNhanSu(Guid userId);
        Task<List<PhongBanSoSanhDto>> GetPhongBanSoSanh(Guid userId, bool onlyCurrentPhongBan = false);
        Task<List<NhanSuSoSanhDto>> GetNhanSuSoSanh(Guid userId, Guid? phongBanId = null, bool theoDonViSuDung = false);
        Task<SoSanhDiemNhanSuDto> GetTopSoSanhDiemNhanSu(Guid userId, Guid idDotDanhGia, bool restrictToCurrentPhongBan = false);
        Task<SoSanhDiemNhanSuDto> GetSoSanhDiemNhanSu(Guid userId, SoSanhDiemNhanSuRequest request, bool restrictToCurrentPhongBan = false);
        Task<bool> ChuyenBuocLuong(ChuyenBuocLuongRequest request);
        Task<bool> ThuHoiPhieu(ThuHoiPhieuRequest request);
        Task<List<NguoiXuLyDto>> GetNguoiXuLyTheoChucVu(Guid idPhieuDanhGia, string chucVuNguoiXuLy);
        Task<KPI_PhieuDanhGiaTabCountDto> GetTabCounts(Guid userId, KPI_PhieuDanhGiaSearch search);
        Task<CheckQuyenChamDiemDto> CheckQuyenChamDiem(Guid? idPhieuDanhGia, Guid? idLyLich, Guid? idDotDanhGia);
    }
}
