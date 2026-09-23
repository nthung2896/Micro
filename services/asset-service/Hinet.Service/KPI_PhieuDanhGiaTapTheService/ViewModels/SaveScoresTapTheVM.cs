using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_PhieuDanhGiaTapTheService.ViewModels
{
    public class SaveScoresTapTheVM
    {
        public Guid IdPhieuDanhGia { get; set; }
        public decimal? DiemTieuChiChung { get; set; }
        public decimal? DiemThucHienNhiemVu { get; set; }
        public decimal? TongDiem { get; set; }
        public int? ChatLuongTuDanhGia { get; set; }
        public int? ChatLuongCapTrenDanhGia { get; set; }
        public List<ScoreTapTheItemVM> Scores { get; set; } = new List<ScoreTapTheItemVM>();
    }

    public class ScoreTapTheItemVM
    {
        public Guid IdTieuChi { get; set; }
        public decimal? DiemTuCham { get; set; }
        public decimal? DiemCapTren { get; set; }
        public string? GhiChu { get; set; }
    }
}
