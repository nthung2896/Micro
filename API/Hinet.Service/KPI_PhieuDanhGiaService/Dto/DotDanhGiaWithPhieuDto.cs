using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class DotDanhGiaWithPhieuDto
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
        public Guid? IdLyLich { get; set; }
        public Guid? IdDonVi { get; set; }
        public Guid? IdPhongBan { get; set; }
        public bool IsCT_PCT { get; set; }
        public bool IsTP_PTP { get; set; }
        public bool IsPhoPhongTroLen { get; set; }
        public bool IsCT { get; set; }
        public bool IsPCT { get; set; }
        public bool IsTP { get; set; }
        public bool IsPTP { get; set; }
        public string? ChucVuNguoiThaoTac { get; set; }

        // Metadata của workflow dành riêng cho màn hình theo dõi đánh giá.
        public string? EvaluationWorkflowType { get; set; }
        public List<EvaluationColumnDto> VisibleEvaluationColumns { get; set; } = new();
        public Dictionary<string, EvaluationRoleScoreDto> EvaluationRoleScores { get; set; } = new();

        // Cấu hình cột hiển thị - backend quyết định dựa trên vai trò người đang đăng nhập.
        public bool ShowTruongPhongCol { get; set; }
        public bool ShowPhoCucCol { get; set; }
        public bool ShowCucTruongCol { get; set; }
        public bool ShowPhoVuTruongCol { get; set; }
        public bool ShowVuTruongCol { get; set; }
        public string? TenChuPhieu { get; set; }
        public string? ChucVuChuPhieu { get; set; }
        public string? ChucVuCodeChuPhieu { get; set; }
        public int? ChucVuPriority { get; set; }
        public string? DonViChuPhieu { get; set; }
        public string? PhongBanChuPhieu { get; set; }
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemThucHienNhiemVu { get; set; }
        public decimal? TongDiem { get; set; }
        
        public decimal? PhoPhong_DiemThucHienNhiemVu { get; set; }
        public decimal? PhoPhong_DiemTieuChiChung { get; set; }
        public decimal? PhoPhong_TongDiem { get; set; }

        public decimal? TruongPhong_DiemThucHienNhiemVu { get; set; }
        public decimal? TruongPhong_DiemTieuChiChung { get; set; }
        public decimal? TruongPhong_TongDiem { get; set; }

        public decimal? PhoVuTruong_DiemThucHienNhiemVu { get; set; }
        public decimal? PhoVuTruong_DiemTieuChiChung { get; set; }
        public decimal? PhoVuTruong_TongDiem { get; set; }

        public decimal? VuTruong_DiemThucHienNhiemVu { get; set; }
        public decimal? VuTruong_DiemTieuChiChung { get; set; }
        public decimal? VuTruong_TongDiem { get; set; }

        public decimal? PhoCucTruong_DiemThucHienNhiemVu { get; set; }
        public decimal? PhoCucTruong_DiemTieuChiChung { get; set; }
        public decimal? PhoCucTruong_TongDiem { get; set; }

        public decimal? CucTruong_DiemThucHienNhiemVu { get; set; }
        public decimal? CucTruong_DiemTieuChiChung { get; set; }
        public decimal? CucTruong_TongDiem { get; set; }
        
        public Guid? IdBoTieuChiChung { get; set; }
        public Guid? IdBoTieuChiNhiemVu { get; set; }
        public string? TenBoTieuChiChung { get; set; }
        public string? TenBoTieuChiNhiemVu { get; set; }
        
        public decimal? DiemTheoBoTieuChi { get; set; }
        public decimal? DiemSoLuong { get; set; }
        public decimal? DiemChatLuong { get; set; }
        public decimal? DiemTienDo { get; set; }

        public string? UuDiem { get; set; }
        public string? HanChe { get; set; }
        public string? YKienNhanXet { get; set; }
        public bool DaDanhGia { get; set; }
        public bool DaDanhGiaNhiemVu { get; set; }
        public int Luong { get; set; }
        public string TrangThai { get; set; }

        public DateTime? ThoiGianTao { get; set; }
        
        public Guid? IdNguoiXuLyHienTai { get; set; }
        public string? TenNguoiXuLyHienTai { get; set; }
        public string? TrangThaiBuocXuLyHienThi { get; set; }

        public ButtonLuongDto? ButtonLuong { get; set; }
        public bool IsShowButton { get; set; }
    }
}
