using Hinet.Service.Dto;
using System;

namespace Hinet.Service.KPI_PhieuDanhGiaTapTheService.Dto
{
    public class KPI_PhieuDanhGiaTapTheSearch : SearchBase
    {
        public string? IdDotDanhGia { get; set; }
        public string? DonVi { get; set; }
        public Guid? IdDonVi { get; set; }
        public int? Luong { get; set; }
        public string? PhongBan { get; set; }
        public Guid? IdPhongBan { get; set; }
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemThucHienNhiemVu { get; set; }
        public decimal? TongDiem { get; set; }
        public int? ChatLuongTuDanhGia { get; set; }
        public int? ChatLuongCapTrenDanhGia { get; set; }
        public string? TrangThai { get; set; }

        public Guid? IdNguoiXuLy { get; set; }
        public bool? IsXuLy { get; set; }
        public bool? IsKhacHoanThanh { get; set; }
        public int? Quy { get; set; }
        public int? Thang { get; set; }
        public int? Nam { get; set; }
    }
}
