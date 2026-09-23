using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_NhiemVu")]
    public class KPI_NhiemVu : AuditableEntity
    {

        public Guid? IdNhiemVuTraVe { get; set; }
        public string? TenNhiemVuDayDu { get; set; }
        public string? TenNhiemVuRutGon { get; set; }
        public Guid? MaLoaiNhiemVu { get; set; }
        public string? TenLoaiNhiemVu { get; set; }
        public string? NhiemVuTrongTam { get; set; }
        public DateTime? ThoiHan { get; set; }
        public DateTime? NgayHoanThanh { get; set; }
        public DateTime? NgayVanBan { get; set; }
        public Guid? MaNhiemVuCha { get; set; }
        public string? LoaiHanXuLy { get; set; } // "deadine"
        public string? Email { get; set; }
        public Guid? IdDotTheoDoiDanhGia { get; set; }
        public Guid? IdLyLich { get; set; }
        public Guid? IdPhongBan { get; set; }
        public string? TenPhongBan { get; set; }
        public Guid? IdNguoiXuLy { get; set; }
        public string? TenNguoiXuLy { get; set; }
        public Guid? IdLinhVuc { get; set; }
        public string? TenLinhVuc { get; set; }
        public int? SoLanCapNhatTienDo { get; set; }
        public bool? IsHoanThanh { get; set; }
        public bool? IsDaDuyet { get; set; }
        public string? Status { get; set; } // Lấy từ nhóm, dữ liệu danh mục
        public string? KetQuaXuLyMoiNhat { get; set; }
        public string? KetQuaTuXepLoai { get; set; }
        public string? KetQuaPhoPhongXepLoai { get; set; }
        public string? KetQuaLanhDaoXepLoai { get; set; }
        public string? Type { get; set; }
        public string? TypeCaNhanTruongBan { get; set; }
        public string? EmailsNguoiThucHien { get; set; }
        public DateTime? TimeDongBo { get; set; } //thời gian đồng bộ nhiệm vụ về hệ thống
        // chỉ số đánh giá =============================================================================
        [DisplayName("Điểm theo bộ tiêu chí")]
        public double? DiemTheoBoTieuChi { get; set; }
        
        // chấm điểm số lượng 
        [DisplayName("Chấm điểm số lượng - Hoàn thành")]
        public double? ChamDiemSoLuong_HoanThanh { get; set; }
        [DisplayName("Chấm điểm số lượng - Không hoàn thành")]
        public double? ChamDiemSoLuong_KhongHoanThanh { get; set; }
        [DisplayName("Chấm điểm số lượng - Điểm")]
        public double? ChamDiemSoLuong_Diem { get; set; }
        
        // chấm điểm chất lượng
        [DisplayName("Chấm điểm chất lượng - Không đạt")]
        public double? ChamDiemChatLuong_KhongDat { get; set; }
        [DisplayName("Chấm điểm chất lượng - Số điểm còn lại")]
        public double? ChamDiemChatLuong_SoDiemConLai { get; set; }
        [DisplayName("Chấm điểm chất lượng - Điểm")]
        public double? ChamDiemChatLuong_Diem { get; set; }

        // chấm điểm tiến độ
        [DisplayName("Chấm điểm tiến độ - Không đạt")]
        public double? ChamDiemTienDo_KhongDat { get; set; }
        [DisplayName("Chấm điểm tiến độ - Số điểm còn lại")]
        public double? ChamDiemTienDo_SoDiemConLai { get; set; }
        [DisplayName("Chấm điểm tiến độ - Điểm")]
        public double? ChamDiemTienDo_Diem { get; set; }


        // GhiChu giải trình
        public string? GhiChuGiaTrinh { get; set; }
        public Guid? IdPhieuDanhGia { get; set; }
    }
}
