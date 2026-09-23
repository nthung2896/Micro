using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;
using Hinet.Service.KPI_PhieuDanhGiaTapTheService.Dto;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using Hinet.Service.KPI_PhieuDanhGiaTapTheService.ViewModels;

namespace Hinet.Service.KPI_PhieuDanhGiaTapTheService
{
    public interface IKPI_PhieuDanhGiaTapTheService : IService<KPI_PhieuDanhGiaTapThe>
    {
        Task<PagedList<KPI_PhieuDanhGiaTapTheDto>> GetData(KPI_PhieuDanhGiaTapTheSearch search);
        Task<KPI_PhieuDanhGiaTapTheDto?> GetDto(Guid id);
        Task<Guid> InitPhieuDanhGiaTapThe(Guid idDotDanhGia, Guid donViId, Guid? phongBanId, Guid? userId);
        Task<PagedList<DotDanhGiaWithPhieuTapTheDto>> GetDotDanhGiaWithPhieu(Guid userId, KPI_PhieuDanhGiaTapTheSearch search);
        Task<PagedList<DotDanhGiaWithPhieuTapTheDto>> GetDanhSachDonViDanhGia(Guid userId, KPI_PhieuDanhGiaTapTheSearch search);
        Task<KPI_PhieuDanhGiaTapTheTabCountDto> GetTabCounts(Guid userId, KPI_PhieuDanhGiaTapTheSearch search);
        Task<bool> ChuyenBuocLuong(ChuyenBuocLuongRequest request);
        Task<bool> ThuHoiPhieu(ThuHoiPhieuRequest request);
        Task<List<NguoiXuLyDto>> GetNguoiXuLyTheoChucVu(Guid idPhieuDanhGia, string chucVuNguoiXuLy);
        Task<CheckQuyenChamDiemDto> CheckQuyenChamDiem(Guid? idPhieuDanhGia, Guid? donViId, Guid? idDotDanhGia, Guid? userId);
        Task<List<KPI_TieuChiTapTheTreeDto>> GetTreeDataForTapThe(Guid idDot, Guid? idPhieu, Guid? idDonVi);
        Task<bool> SaveScoresTapThe(SaveScoresTapTheVM model, Guid currentUserId);
    }
}

