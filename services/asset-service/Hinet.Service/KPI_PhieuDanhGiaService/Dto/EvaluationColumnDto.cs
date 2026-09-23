namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class EvaluationColumnDto
    {
        public string RoleCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Order { get; set; }
        public string Color { get; set; } = "#4b5563";
        public string TargetStatus { get; set; } = string.Empty;
        // Mã role dữ liệu dùng khi mở chi tiết; RoleCode vẫn là mã hiển thị của workflow.
        public string ViewRoleCode { get; set; } = string.Empty;
    }

    public class EvaluationRoleScoreDto
    {
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemThucHienNhiemVu { get; set; }
        public decimal? TongDiem { get; set; }
    }
}
