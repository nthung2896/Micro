using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService.ViewModels
{
    public class KPI_TieuChiChung_DiemSo_CapTrenSaveBatchVM
    {
        public Guid IdPhieuDanhGia { get; set; }
        public bool IsHoanTat { get; set; }
        public List<KPI_TieuChiChung_DiemSo_CapTrenSaveBatchItemVM> Items { get; set; } = new();
    }

    public class KPI_TieuChiChung_DiemSo_CapTrenSaveBatchItemVM
    {
        public Guid IdTieuChiChungDiemSo { get; set; }
        public decimal? Diem { get; set; }
        public string? GhiChu { get; set; }
    }
}
