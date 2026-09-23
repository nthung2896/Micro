using System;

namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class ChuyenBuocLuongRequest
    {
        public Guid IdPhieuDanhGia { get; set; }
        public Guid IdNguoiGui { get; set; }
        public Guid? IdNguoiXuLy { get; set; }
        public string? GhiChu { get; set; }
        public bool IsTuChoi { get; set; }
    }
}
