using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_NhiemVuService.Dto
{
    public class KPI_DauRaNhiemVuCreateDto
    {
        public Guid? Id { get; set; }
        public string? ClientKey { get; set; }
        public List<Guid> KeptAttachmentIds { get; set; } = new();
        public bool AttachmentsTouched { get; set; }
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
    }
}
