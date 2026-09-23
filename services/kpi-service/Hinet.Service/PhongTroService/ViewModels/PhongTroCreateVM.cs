using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.PhongTroService.ViewModels
{
    public class PhongTroCreateVM
    {
        [Required(ErrorMessage = "Vui lòng nhập tiêu đề")]
        [StringLength(500, ErrorMessage = "Tiêu đề không được vượt quá 500 ký tự")]
        public string TieuDe { get; set; } = string.Empty;

        public string? MaPhong { get; set; }
        public string? TenPhong { get; set; }
        public string? LoaiPhong { get; set; }

        #region Địa chỉ hành chính & Vị trí
        public string? DiaChi { get; set; }
        public string? MaTinh { get; set; }
        public string? TenTinh { get; set; }
        public string? MaHuyen { get; set; }
        public string? TenHuyen { get; set; }
        public string? MaXa { get; set; }
        public string? TenXa { get; set; }
        public string? ToaDo { get; set; }
        #endregion

        #region Thông tin cho thuê & Diện tích
        public double? DienTich { get; set; }
        public decimal? GiaChoThue { get; set; }
        public decimal? TienCoc { get; set; }
        public int? Tang { get; set; }
        public int? SoNguoiOToiDa { get; set; }
        public int? SoPhongNgu { get; set; }
        public int? SoPhongTam { get; set; }
        #endregion

        #region Giá dịch vụ
        public decimal? GiaDien { get; set; }
        public string? DonViDien { get; set; } = "Số";
        public decimal? GiaNuoc { get; set; }
        public string? DonViNuoc { get; set; } = "Khối";
        public decimal? GiaInternet { get; set; }
        public string? DonViInternet { get; set; } = "Phòng";
        public decimal? GiaDichVuChung { get; set; }
        public string? DonViDichVuChung { get; set; } = "Người";
        public decimal? GiaGuiXe { get; set; }
        public decimal? GiaVeSinh { get; set; }
        #endregion

        #region Tiện nghi & Nội thất
        public bool? GioGiacTuDo { get; set; } = true;
        public string? QuyDinhGioGiac { get; set; }
        public bool? CoMayGiat { get; set; }
        public bool? CoDieuHoa { get; set; }
        public bool? CoNongLanh { get; set; }
        public bool? CoTuLanh { get; set; }
        public bool? CoGiuongTu { get; set; }
        public bool? CoBanCong { get; set; }
        public bool? CoThangMay { get; set; }
        public bool? CoChoDeXe { get; set; }
        public bool? CoKhoaVanTay { get; set; }
        public bool? KhongChungChu { get; set; }
        public bool? ChoNuoiThuCung { get; set; }
        public bool? CoKeBep { get; set; }
        public string? TienNghiKhac { get; set; }
        #endregion

        #region Hình ảnh & Truyền thông
        public string? HinhAnhDaiDien { get; set; }
        public string? DanhSachHinhAnh { get; set; }
        public string? VideoLink { get; set; }
        public List<Guid>? FileDinhKemIds { get; set; }
        public Guid? AvatarFileId { get; set; }
        #endregion

        #region Thông tin liên hệ
        public string? TenLienHe { get; set; }
        public string? SoDienThoaiLienHe { get; set; }
        public string? ZaloLienHe { get; set; }
        #endregion

        #region Mô tả, Quy định & Trạng thái
        public string? MoTa { get; set; }
        public string? QuyDinh { get; set; }
        public int TrangThai { get; set; } = 0;
        public DateTime? NgayTrong { get; set; }
        public bool IsNoiBat { get; set; } = false;
        public int LuotXem { get; set; } = 0;
        #endregion

        #region Sàn giao dịch & Quản lý
        public Guid? ChuTroId { get; set; }
        public int GoiTin { get; set; } = 0;
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayHetHan { get; set; }
        public DateTime? NgayDayTin { get; set; }
        public int SoLuotDayTin { get; set; } = 0;
        public decimal? PhiDangTin { get; set; }
        public int TrangThaiDuyet { get; set; } = 1;
        public string? LyDoTuChoi { get; set; }
        public string? NguoiDuyet { get; set; }
        public DateTime? NgayDuyet { get; set; }
        #endregion
    }
}