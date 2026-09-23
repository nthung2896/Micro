using Hinet.Service.Dto;

namespace Hinet.Service.KPI_QuaTrinhXuLyPhieuDanhGiaService.Dto
{
    public class KPI_QuaTrinhXuLyPhieuDanhGiaSearch : SearchBase
    {
        public Guid? IdPhieuDanhGia { get; set; }
        public bool? IsXuLy { get; set; }
        public Guid? IdNguoiXuLy { get; set; }
        public Guid? IdNguoiGui { get; set; }
        public string? TrangThai { get; set; }
        public string? GhiChu { get; set; }
    }
}
