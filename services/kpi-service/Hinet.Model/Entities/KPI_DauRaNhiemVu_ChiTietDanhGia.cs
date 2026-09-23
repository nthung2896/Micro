using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hinet.Model.Entities
{
    [Table("KPI_DauRaNhiemVu_ChiTietDanhGia")]
    public class KPI_DauRaNhiemVu_ChiTietDanhGia : AuditableEntity
    {
        public Guid IdDauRaNhiemVu { get; set; }


        public Guid? IdPhieuDanhGia { get; set; }

        // Vai trò đánh giá (vd: "CaNhan", "PhoPhong", "TruongPhong", "LanhDaoCuc")
        public string? VaiTroDanhGia { get; set; }

        // Ai là người thực hiện đánh giá dòng này
        public Guid? NguoiDanhGiaId { get; set; }

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

        // GhiChu giải trình / lý do trừ điểm của người đánh giá
        public string? GhiChu { get; set; }
    }
}
