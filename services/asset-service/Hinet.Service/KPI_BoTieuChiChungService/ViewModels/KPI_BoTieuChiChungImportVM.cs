using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_BoTieuChiChungService.ViewModels
{
    public class KPI_BoTieuChiChungImportVM
    {
        public Guid? IdDonVi { get; set; }
        public Guid? IdDot { get; set; }
        public DateTime? ApDungTuNgay { get; set; }
        public DateTime? ApDungToiNgay { get; set; }
        public string? TenBoTieuChiDonVi { get; set; }
        public int RowStart { get; set; } = 4;
        public int? RowName { get; set; } = 2;
        public string? SoQuyetDinh { get; set; }
        public DateTime? NgayQuyetDinh { get; set; }
        public int? RowInfo { get; set; } = 3;
        public int TotalColumns { get; set; } = 4;
        public int StartCol { get; set; } = 1;
        public string? WorkSheetName { get; set; }
        public bool? IsActive { get; set; } = true;
    }
}
