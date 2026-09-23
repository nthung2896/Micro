namespace Hinet.Service.KPI_KetQuaThucHienNhiemVuService.Dto
{
    public class HeSoLanhDaoApDungDto
    {
        public bool DaChotHeSo { get; set; }
        public bool CoApDungHeSo { get; set; }
        public decimal? HeSo { get; set; }
        public string? ChucVuCode { get; set; }
        public string? TenChucVu { get; set; }
        public string NguonDuLieu { get; set; } = "cauHinhHienTai";
    }
}
