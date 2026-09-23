using System;
using Hinet.Service.Dto;

namespace Hinet.Service.KPI_LyLich2CService.Request
{
    public class KPI_LyLich2CSearch : SearchBase
    {
        public string? HoTen { get; set; }
        public string? UserName { get; set; }
        public string? TaiKhoan { get; set; }
        public string? MaCanBo { get; set; }
        public Guid? DonViSuDungId { get; set; }
        public Guid? PhongBanId { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public Guid? UserId { get; set; }
        public int? GioiTinh { get; set; }
        public Guid? RoleId { get; set; }
        public DateTime? NgaysinhFrom { get; set; }
        public DateTime? NgaysinhTo { get; set; }
        public string? ChucVuHienTai { get; set; }
        public string? TrinhDoMax { get; set; }
        public string? LyLuanChinhTri { get; set; }
        public string? LoaiHopDong { get; set; }
    }
}
