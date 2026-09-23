using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_DauRaNhiemVu_ChiTietDanhGiaService.ViewModels
{
    public class SaveBatchChiTietDanhGiaRequest
    {
        public Guid IdPhieuDanhGia { get; set; }
        public string VaiTroDanhGia { get; set; }
        public Guid? NguoiDanhGiaId { get; set; }
        public List<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateVM> Items { get; set; } = new List<KPI_DauRaNhiemVu_ChiTietDanhGiaCreateVM>();
    }
}
