using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Hinet.Model.Entities;
using Hinet.Service.Common.Service;
using Hinet.Service.ViTienService.Dto;

namespace Hinet.Service.ViTienService
{
    public interface IViTienService : IService<Room_ViTien>
    {
        Task<ViTienDto> GetThongTinVi(Guid userId);
        Task<GiaoDichNapTienDto> TaoYeuCauNap(TaoYeuCauNapRequest request, Guid userId);
        Task<bool> XacNhanNapTien(string maGiaoDich, Guid? adminId = null, string? adminName = null);
        Task<KetQuaThanhToanDto> ThanhToanDichVu(ThanhToanDichVuRequest request, Guid userId);
        Task<List<GiaoDichNapTienDto>> GetLichSuNapTien(Guid userId, int? trangThai = null);
        Task<List<LichSuThanhToanDto>> GetLichSuThanhToan(Guid userId);
        Task<List<Room_CauHinhKhuyenMaiNap>> GetDanhSachKhuyenMai();
        Task<Room_ThongTinNganHang?> GetThongTinNganHangDefault();
    }
}
