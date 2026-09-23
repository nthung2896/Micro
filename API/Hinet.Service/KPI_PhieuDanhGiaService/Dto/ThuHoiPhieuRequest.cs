using System;

namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class ThuHoiPhieuRequest
    {
        public Guid IdPhieuDanhGia { get; set; }
        public Guid IdNguoiThuHoi { get; set; }
        public string? GhiChu { get; set; }
    }
}
