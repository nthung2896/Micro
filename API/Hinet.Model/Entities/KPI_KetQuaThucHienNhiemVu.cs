using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("KPI_KetQuaThucHienNhiemVu")]
    public class KPI_KetQuaThucHienNhiemVu : AuditableEntity
    {
        public Guid? IdPhieuDanhGia { get; set; }
        public Guid? IdLyLich { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public double? DiemBoTieuChi { get; set; } 
        public double? DiemHeSoLanhDao { get; set; } 

        // Snapshot hệ số lãnh đạo tại lần lưu phiếu đầu tiên.
        public bool DaChotHeSoLanhDao { get; set; } = false;   // đã lưu phiếu = true
        public bool CoApDungHeSoLanhDao { get; set; } = false; // đã lưu phiếu và có áp dụng hệ số =  true
        public decimal? HeSoLanhDaoApDung { get; set; }        // hệ số tại thời điểm lưu
        public string? ChucVuLanhDaoApDung { get; set; }       // mã chức vụ tại thời điểm lưu
        public double? KhoiLuongDiem { get; set; }
        public double? KhoiLuongPhanTram { get; set; }

        public double? ChatLuongDiem { get; set; }
        public double? ChatLuongPhanTram { get; set; }

        // Tiến độ
        public double? TienDoDiem { get; set; }
        public double? TienDoPhanTram { get; set; }

        
        public double? KetQuaLinhVucPhanTram { get; set; }

        public double? KhaNangToChucPhanTram { get; set; }

        public double? NangLucTapHopPhanTram { get; set; }

        public string? GhiChuGiaiTrinh { get; set; }

        public double? DiemTieuChiKetQua { get; set; }
    }
}
