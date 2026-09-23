using Hinet.Model.Entities;
using Hinet.Service.KPI_PhieuDanhGiaService.Dto;
using System;

namespace Hinet.Service.KPI_PhieuDanhGiaTapTheService.Dto
{
    public class KPI_PhieuDanhGiaTapTheDto : KPI_PhieuDanhGiaTapThe
    {
        public string? TenDotDanhGia { get; set; }
        public string? TenDonVi { get; set; }
        public string? TenPhongBan { get; set; }
        public string? TenChatLuongTuDanhGia { get; set; }
        public string? TenChatLuongCapTrenDanhGia { get; set; }
        public ButtonLuongDto? ButtonLuong { get; set; }

        public Guid? IdBoTieuChiChung { get; set; }
        public string? TenBoTieuChiChung { get; set; }
        public Guid? IdBoTieuChiNhiemVu { get; set; }
        public string? TenBoTieuChiNhiemVu { get; set; }

        public DateTime? ThoiGianBatDau { get; set; }
        public DateTime? ThoiGianKetThuc { get; set; }
        public int? Thang { get; set; }
        public int? Quy { get; set; }
        public int? Nam { get; set; }
        public string? TrangThaiDot { get; set; }
    }
}
