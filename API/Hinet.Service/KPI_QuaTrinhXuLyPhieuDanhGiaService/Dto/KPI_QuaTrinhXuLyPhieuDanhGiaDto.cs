using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;

namespace Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService.Dto
{
    public class KPI_QuaTrinhXuLyPhieuDanhGiaDto : KPI_QuaTrinhXuLyPhieuDanhGia
    {
        public string? TenNguoiGui { get; set; }
        public string? ChucVuNguoiGui { get; set; }
        public string? TenNguoiXuLy { get; set; }
        public string? ChucVuNguoiXuLy { get; set; }
        public string? NguoiGuiUserName { get; set; }
        public string? NguoiXuLyUserName { get; set; }
        public DateTime? ThoiGianThaoTac { get; set; }
    }
}
