using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;

namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class KPI_PhieuDanhGiaDto : KPI_PhieuDanhGia
    {
        public string? HoTen { get; set; }
        public string? TenPhongBan { get; set; }
        public string? TenDonVi { get; set; }
        public ButtonLuongDto? ButtonLuong { get; set; }
    }
}
