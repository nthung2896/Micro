using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_TieuChiChung_DiemSoService.Dto
{
    public class KPI_ThongKeQuyDonViDto
    {
        public Guid PhongBanId { get; set; }
        public string TenPhongBan { get; set; }
        public double DiemTrungBinhQuy { get; set; }
        public int SoLuongNhanSu { get; set; }
        public int SoLuongDaDanhGia { get; set; }
        public List<KPI_TongHopTieuChiChungNhanSuDto> ListNhanSu { get; set; } = new List<KPI_TongHopTieuChiChungNhanSuDto>();
    }
}
