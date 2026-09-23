namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class ThongKePhieuDanhGiaTheoThangDto
    {
        public int Thang { get; set; }
        public Guid? IdPhieuDanhGia { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public string? TenDotDanhGia { get; set; }
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemThucHienNhiemVu { get; set; }
        public decimal? TongDiem { get; set; }
        public DateTime? ThoiGianTao { get; set; }
        public string TenTieuChiChung { get; set; } = "Điểm tiêu chí chung";
        public decimal DiemToiDaTieuChiChung { get; set; } = 30;
        public string TenTieuChiKetQua { get; set; } = "Điểm tiêu chí kết quả thực hiện nhiệm vụ";
        public decimal DiemToiDaTieuChiKetQua { get; set; } = 70;
        public decimal? DiemTheoBoTieuChi { get; set; }
        public decimal? DiemSoLuong { get; set; }
        public decimal? DiemChatLuong { get; set; }
        public decimal? DiemTienDo { get; set; }
        
        public decimal? SoLuongKhongHoanThanh { get; set; }
        public decimal? ChatLuongKhongDat { get; set; }
        public decimal? TienDoChamMuon { get; set; }
    }
}
