using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("PhongTro")]
    [DisplayName("Phòng trọ / Bất động sản cho thuê")]
    public class PhongTro : AuditableEntity
    {
        [DisplayName("Tiêu đề")]
        [Required]
        [StringLength(500)]
        public string TieuDe { get; set; } = string.Empty;

        [DisplayName("Mã phòng / Số phòng")]
        [StringLength(100)]
        public string? MaPhong { get; set; }

        [DisplayName("Tên phòng")]
        [StringLength(250)]
        public string? TenPhong { get; set; }

        [DisplayName("Loại bất động sản / Loại phòng")]
        [StringLength(250)]
        public string? LoaiPhong { get; set; } // Ví dụ: Mặt bằng kinh doanh, Phòng trọ, Chung cư mini, Căn hộ...

        #region Địa chỉ hành chính & Vị trí
        [DisplayName("Địa chỉ chi tiết")]
        [StringLength(500)]
        public string? DiaChi { get; set; }

        [DisplayName("Mã Tỉnh / TP")]
        [StringLength(50)]
        public string? MaTinh { get; set; }

        [DisplayName("Tên Tỉnh / TP")]
        [StringLength(250)]
        public string? TenTinh { get; set; }

        [DisplayName("Mã Quận / Huyện")]
        [StringLength(50)]
        public string? MaHuyen { get; set; }

        [DisplayName("Tên Quận / Huyện")]
        [StringLength(250)]
        public string? TenHuyen { get; set; }

        [DisplayName("Mã Phường / Xã")]
        [StringLength(50)]
        public string? MaXa { get; set; }

        [DisplayName("Tên Phường / Xã")]
        [StringLength(250)]
        public string? TenXa { get; set; }

        [DisplayName("Tọa độ (kinh độ, vĩ độ)")]
        [StringLength(100)]
        public string? ToaDo { get; set; }
        #endregion

        #region Thông tin cho thuê & Diện tích
        [DisplayName("Diện tích (m2)")]
        public double? DienTich { get; set; }

        [DisplayName("Giá cho thuê (VNĐ/tháng)")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaChoThue { get; set; }

        [DisplayName("Tiền cọc (VNĐ)")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? TienCoc { get; set; }

        [DisplayName("Tầng")]
        public int? Tang { get; set; }

        [DisplayName("Số người ở tối đa")]
        public int? SoNguoiOToiDa { get; set; }

        [DisplayName("Số phòng ngủ")]
        public int? SoPhongNgu { get; set; }

        [DisplayName("Số phòng tắm/vệ sinh")]
        public int? SoPhongTam { get; set; }
        #endregion

        #region Giá dịch vụ
        [DisplayName("Giá điện (VNĐ/Số)")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaDien { get; set; }

        [DisplayName("Đơn vị tính điện")]
        [StringLength(50)]
        public string? DonViDien { get; set; } = "Số";

        [DisplayName("Giá nước (VNĐ/Khối hoặc Người)")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaNuoc { get; set; }

        [DisplayName("Đơn vị tính nước")]
        [StringLength(50)]
        public string? DonViNuoc { get; set; } = "Khối";

        [DisplayName("Giá Internet / Mạng (VNĐ/Phòng hoặc Người)")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaInternet { get; set; }

        [DisplayName("Đơn vị tính Internet")]
        [StringLength(50)]
        public string? DonViInternet { get; set; } = "Phòng";

        [DisplayName("Giá dịch vụ chung (VNĐ/Người)")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaDichVuChung { get; set; }

        [DisplayName("Đơn vị tính dịch vụ chung")]
        [StringLength(50)]
        public string? DonViDichVuChung { get; set; } = "Người";

        [DisplayName("Phí gửi xe (VNĐ/xe)")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaGuiXe { get; set; }

        [DisplayName("Phí vệ sinh (VNĐ)")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GiaVeSinh { get; set; }
        #endregion

        #region Tiện nghi & Nội thất
        [DisplayName("Giờ giấc tự do")]
        public bool? GioGiacTuDo { get; set; } = true;

        [DisplayName("Quy định giờ giấc")]
        [StringLength(250)]
        public string? QuyDinhGioGiac { get; set; }

        [DisplayName("Có máy giặt")]
        public bool? CoMayGiat { get; set; }

        [DisplayName("Có điều hòa")]
        public bool? CoDieuHoa { get; set; }

        [DisplayName("Có bình nóng lạnh")]
        public bool? CoNongLanh { get; set; }

        [DisplayName("Có tủ lạnh")]
        public bool? CoTuLanh { get; set; }

        [DisplayName("Có giường tủ")]
        public bool? CoGiuongTu { get; set; }

        [DisplayName("Có ban công / cửa sổ thoáng")]
        public bool? CoBanCong { get; set; }

        [DisplayName("Có thang máy")]
        public bool? CoThangMay { get; set; }

        [DisplayName("Có chỗ để xe")]
        public bool? CoChoDeXe { get; set; }

        [DisplayName("Khóa vân tay / Camera an ninh")]
        public bool? CoKhoaVanTay { get; set; }

        [DisplayName("Không chung chủ")]
        public bool? KhongChungChu { get; set; }

        [DisplayName("Cho phép nuôi thú cưng")]
        public bool? ChoNuoiThuCung { get; set; }

        [DisplayName("Có kệ bếp / bếp riêng")]
        public bool? CoKeBep { get; set; }

        [DisplayName("Tiện nghi khác (JSON hoặc chuỗi mô tả)")]
        public string? TienNghiKhac { get; set; }
        #endregion

        #region Hình ảnh & Truyền thông
        [DisplayName("Ảnh đại diện chính")]
        [StringLength(500)]
        public string? HinhAnhDaiDien { get; set; }

        [DisplayName("Danh sách hình ảnh (JSON hoặc phân cách dấu phẩy)")]
        public string? DanhSachHinhAnh { get; set; }

        [DisplayName("Video giới thiệu phòng")]
        [StringLength(500)]
        public string? VideoLink { get; set; }
        #endregion

        #region Thông tin liên hệ
        [DisplayName("Tên người liên hệ / Chủ nhà")]
        [StringLength(250)]
        public string? TenLienHe { get; set; }

        [DisplayName("Số điện thoại liên hệ")]
        [StringLength(50)]
        public string? SoDienThoaiLienHe { get; set; }

        [DisplayName("Zalo liên hệ")]
        [StringLength(50)]
        public string? ZaloLienHe { get; set; }
        #endregion

        #region Mô tả, Quy định & Trạng thái
        [DisplayName("Mô tả chi tiết")]
        public string? MoTa { get; set; }

        [DisplayName("Nội quy / Quy định phòng")]
        public string? QuyDinh { get; set; }

        [DisplayName("Trạng thái phòng (0: Còn trống, 1: Đã thuê, 2: Tạm ngưng)")]
        public int TrangThai { get; set; } = 0;

        [DisplayName("Ngày phòng bắt đầu trống")]
        public DateTime? NgayTrong { get; set; }

        [DisplayName("Tin nổi bật")]
        public bool IsNoiBat { get; set; } = false;

        [DisplayName("Lượt xem")]
        public int LuotXem { get; set; } = 0;
        #endregion

        #region Sàn giao dịch & Quản lý thu phí
        [DisplayName("ID Chủ trọ / Người đăng tin")]
        public Guid? ChuTroId { get; set; }

        [DisplayName("Gói tin đăng (0: Tin thường, 1: VIP 1, 2: VIP 2, 3: VIP Nổi bật)")]
        public int GoiTin { get; set; } = 0;

        [DisplayName("Ngày bắt đầu hiển thị")]
        public DateTime? NgayBatDau { get; set; }

        [DisplayName("Ngày hết hạn tin đăng")]
        public DateTime? NgayHetHan { get; set; }

        [DisplayName("Thời điểm đẩy tin gần nhất")]
        public DateTime? NgayDayTin { get; set; }

        [DisplayName("Số lượt đã đẩy tin")]
        public int SoLuotDayTin { get; set; } = 0;

        [DisplayName("Phí đăng tin / phí dịch vụ đã trả (VNĐ)")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? PhiDangTin { get; set; }

        [DisplayName("Trạng thái kiểm duyệt (0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối, 3: Hết hạn)")]
        public int TrangThaiDuyet { get; set; } = 1;

        [DisplayName("Lý do từ chối kiểm duyệt")]
        [StringLength(500)]
        public string? LyDoTuChoi { get; set; }

        [DisplayName("Người duyệt tin")]
        public string? NguoiDuyet { get; set; }

        [DisplayName("Ngày duyệt tin")]
        public DateTime? NgayDuyet { get; set; }
        #endregion
    }
}
