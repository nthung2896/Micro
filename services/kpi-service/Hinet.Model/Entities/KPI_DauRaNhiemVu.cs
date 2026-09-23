using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("KPI_DauRaNhiemVu")]
    public class KPI_DauRaNhiemVu : AuditableEntity
    {
        public Guid? IdNhiemVu {  get; set; }
        public Guid? IdThoiDiemDongBoVanBan { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public string? TypeVanBan { get; set; }
        public string? TenSanPhamDauRa { get; set; }

        // chỉ số đánh giá =============================================================================
        public Guid? TieuChiId { get; set; }
        public double? DiemTheoBoTieuChi { get; set; }
        // chấm điểm số lượng 
        public double? ChamDiemSoLuong_HoanThanh { get; set; }
        public double? ChamDiemSoLuong_KhongHoanThanh { get; set; }
        public double? ChamDiemSoLuong_Diem { get; set; }
        // chấm điểm chất lượng
        public double? ChamDiemChatLuong_KhongDat { get; set; }
        public double? ChamDiemChatLuong_SoDiemConLai { get; set; }
        public double? ChamDiemChatLuong_Diem { get; set; }

        // chấm điểm tiến độ
        public double? ChamDiemTienDo_KhongDat { get; set; }
        public double? ChamDiemTienDo_SoDiemConLai { get; set; }
        public double? ChamDiemTienDo_Diem { get; set; }


        // GhiChu giải trình
        public string? GhiChuGiaTrinh { get; set; }

        [NotMapped]
        public string? TenTieuChi { get; set; }
    }
}
