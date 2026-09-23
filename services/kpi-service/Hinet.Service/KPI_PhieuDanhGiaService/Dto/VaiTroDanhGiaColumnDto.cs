using System;

namespace Hinet.Service.KPI_PhieuDanhGiaService.Dto
{
    public class VaiTroDanhGiaColumnDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string ShortLabel { get; set; } = string.Empty;
        public string ScoreTitle { get; set; } = string.Empty;
        public string Color { get; set; } = "#4b5563";
        public string BgColor { get; set; } = "#f3f4f6";
        public int Order { get; set; }
        public bool IsEditable { get; set; }
    }
}
