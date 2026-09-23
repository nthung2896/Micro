using System;

namespace Hinet.Service.KPI_NhiemVuService.Dto
{
    public class SaveKetQuaThucHienNhiemVuDto
    {
        public Guid? IdPhieuDanhGia { get; set; }
        public Guid? IdLyLich { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public double? DiemBoTieuChi { get; set; }
        public double? DiemHeSoLanhDao { get; set; }

        public double? KhoiLuongDiem { get; set; }
        public double? KhoiLuongPhanTram { get; set; }

        public double? ChatLuongDiem { get; set; }
        public double? ChatLuongPhanTram { get; set; }

        public double? TienDoDiem { get; set; }
        public double? TienDoPhanTram { get; set; }

        public double? KetQuaLinhVucPhanTram { get; set; }
        public double? KhaNangToChucPhanTram { get; set; }
        public double? NangLucTapHopPhanTram { get; set; }
        public string? GhiChuGiaiTrinh { get; set; }
        public double? DiemTieuChiKetQua { get; set; }
    }
}
