using Hinet.Model.Entities;
using Hinet.Service.PhongTroService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;

namespace Hinet.Service.PhongTroService
{
    public interface IPhongTroService : IService<PhongTro>
    {
        Task<PagedList<PhongTroDto>> GetData(PhongTroSearch search);
        Task<PhongTroDto?> GetDto(Guid id);
        Task<PhongTro?> DayTin(Guid id);
        Task<PhongTro?> GiaHan(Guid id, int soNgay);
        Task<PhongTro?> NangCapVip(Guid id, int goiTin, int? soNgay = null);
        Task<PhongTro?> GanNhan(Guid id);
        Task<PhongTro?> DoiTrangThai(Guid id);
        Task<PhongTro?> DuyetTin(Guid id, int trangThaiDuyet, string? lyDoTuChoi = null, string? nguoiDuyet = null);
        Task<ThongKeTinDangDto> GetThongKe(Guid? chuTroId = null);
    }
}
