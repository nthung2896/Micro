using Hinet.Service.KPI_PhieuDanhGiaService.Dto;
using System;

namespace Hinet.Service.KPI_PhieuDanhGiaTapTheService.Dto
{
    public class DotDanhGiaWithPhieuTapTheDto
    {
        public Guid IdDotDanhGia { get; set; }
        public string? TenDotDanhGia { get; set; }
        public int? Thang { get; set; }
        public int? Quy { get; set; }
        public int? Nam { get; set; }
        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
        public string? TrangThaiDot { get; set; }

        public Guid? IdPhieuDanhGia { get; set; }
        public Guid? IdDonVi { get; set; }
        public string? TenDonVi { get; set; }
        public string? PhongBan { get; set; }
        public string? TenPhongBan { get; set; }

        public Guid? IdBoTieuChiChung { get; set; }
        public string? TenBoTieuChiChung { get; set; }
        public Guid? IdBoTieuChiNhiemVu { get; set; }
        public string? TenBoTieuChiNhiemVu { get; set; }

        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemThucHienNhiemVu { get; set; }
        public decimal? TongDiem { get; set; }
        public decimal? DiemCapTrenTieuChiChung { get; set; }
        public decimal? DiemCapTrenThucHienNhiemVu { get; set; }
        public decimal? DiemCapTrenTongDiem { get; set; }
        public int? ChatLuongTuDanhGia { get; set; }
        public string? TenChatLuongTuDanhGia { get; set; }
        public int? ChatLuongCapTrenDanhGia { get; set; }
        public string? TenChatLuongCapTrenDanhGia { get; set; }

        public bool DaDanhGia { get; set; }
        public DateTime? ThoiGianTao { get; set; }
        public string? TrangThai { get; set; }
        public int? Luong { get; set; }
        public ButtonLuongDto? ButtonLuong { get; set; }
        public bool IsShowButton { get; set; }
    }
}
