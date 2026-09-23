using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_TieuChiChung_DiemSoService.ViewModels
{
    /// <summary>
    /// ViewModel lưu điểm tiêu chí chung cho luồng v1 (phiên bản cũ)
    /// </summary>
    public class KPI_TieuChiChung_DiemSoSaveVM
    {
        public Guid? IdLyLich { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public string? UuDiem { get; set; }
        public string? HanChe { get; set; }
        public string? YKienNhanXet { get; set; }
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? TongDiem { get; set; }
        public List<ScoreItem> Scores { get; set; } = new List<ScoreItem>();
    }

    /// <summary>
    /// ViewModel lưu điểm tiêu chí chung và thông tin phiếu cho luồng v2 (phiên bản mới / đa cấp)
    /// </summary>
    public class KPI_TieuChiChung_DiemSoSaveV2VM
    {
        public Guid? IdPhieuDanhGia { get; set; }
        public Guid? IdLyLich { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public string? UuDiem { get; set; }
        public string? HanChe { get; set; }
        public string? YKienNhanXet { get; set; }
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemThucHienNhiemVu { get; set; }
        public decimal? TongDiem { get; set; }
        public string? VaiTroDanhGia { get; set; }
        public List<ScoreItem> Scores { get; set; } = new List<ScoreItem>();
    }

    public class ScoreItem
    {
        public Guid IdTieuChiChung { get; set; }
        public decimal DiemTuCham { get; set; }
    }
}
