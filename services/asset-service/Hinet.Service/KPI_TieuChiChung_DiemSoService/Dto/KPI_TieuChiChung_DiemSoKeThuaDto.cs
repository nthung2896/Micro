namespace Hinet.Service.KPI_TieuChiChung_DiemSoService.Dto
{
    /// <summary>
    /// Dữ liệu các phiếu có thể dùng để kế thừa điểm tiêu chí chung.
    /// </summary>
    public class KPI_TieuChiChung_DiemSoKeThuaResponseDto
    {
        public Guid? IdBoTieuChiChung { get; set; }
        public string? TenBoTieuChiChung { get; set; }
        public List<KPI_TieuChiChung_DiemSoKeThuaNguonDto> DanhSachNguon { get; set; } = new();
    }

    public class KPI_TieuChiChung_DiemSoKeThuaNguonDto
    {
        public Guid IdDotDanhGia { get; set; }
        public string? TenDotDanhGia { get; set; }
        public Guid IdPhieuDanhGia { get; set; }
        public decimal TongDiemTieuChiChung { get; set; }
        public List<KPI_TieuChiChung_DiemSoKeThuaTieuChiDto> CayTieuChi { get; set; } = new();
    }

    public class KPI_TieuChiChung_DiemSoKeThuaTieuChiDto
    {
        public Guid IdTieuChiChung { get; set; }
        public string? Stt { get; set; }
        public string? Ten { get; set; }
        public decimal? DiemToiDa { get; set; }
        public decimal DiemTuCham { get; set; }
        public List<KPI_TieuChiChung_DiemSoKeThuaTieuChiDto> Children { get; set; } = new();
    }
}
