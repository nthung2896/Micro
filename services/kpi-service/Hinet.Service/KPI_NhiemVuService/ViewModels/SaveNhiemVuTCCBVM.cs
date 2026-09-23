using System;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.KPI_NhiemVuService.ViewModels
{
    public class SaveNhiemVuTCCBVM
    {
        public Guid? Id { get; set; }
        public Guid? IdPhieuDanhGia { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public Guid? IdLyLich { get; set; }
        public Guid? TieuChiId { get; set; }
        public string MoTaCongViec { get; set; }
        public string TenSanPhamDauRa { get; set; }
        public double? DiemTheoBoTieuChi { get; set; }
        public double? ChamDiemSoLuong_HoanThanh { get; set; }
        public double? ChamDiemSoLuong_KhongHoanThanh { get; set; }
        public double? ChamDiemSoLuong_Diem { get; set; }
        public double? ChamDiemChatLuong_KhongDat { get; set; }
        public double? ChamDiemChatLuong_SoDiemConLai { get; set; }
        public double? ChamDiemChatLuong_Diem { get; set; }
        public double? ChamDiemTienDo_KhongDat { get; set; }
        public double? ChamDiemTienDo_SoDiemConLai { get; set; }
        public double? ChamDiemTienDo_Diem { get; set; }
        public string GhiChuGiaTrinh { get; set; }
    }
}
