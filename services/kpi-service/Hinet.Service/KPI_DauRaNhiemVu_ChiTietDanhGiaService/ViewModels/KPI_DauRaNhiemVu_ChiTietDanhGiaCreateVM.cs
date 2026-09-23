using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService.ViewModels
{
    public class KPI_DauRaNhiemVu_ChiTietDanhGiaCreateVM
    {
		public Guid IdDauRaNhiemVu { get; set; }
		public Guid? IdPhieuDanhGia { get; set; }
		public string? VaiTroDanhGia { get; set; }
		public Guid? NguoiDanhGiaId { get; set; }
		public double? ChamDiemSoLuong_HoanThanh { get; set; }
		public double? ChamDiemSoLuong_KhongHoanThanh { get; set; }
		public double? ChamDiemSoLuong_Diem { get; set; }
		public double? ChamDiemChatLuong_KhongDat { get; set; }
		public double? ChamDiemChatLuong_SoDiemConLai { get; set; }
		public double? ChamDiemChatLuong_Diem { get; set; }
		public double? ChamDiemTienDo_KhongDat { get; set; }
		public double? ChamDiemTienDo_SoDiemConLai { get; set; }
		public double? ChamDiemTienDo_Diem { get; set; }
		public string? GhiChu { get; set; }
    }
}
