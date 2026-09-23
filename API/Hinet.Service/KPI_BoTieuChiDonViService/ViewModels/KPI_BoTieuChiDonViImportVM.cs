using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.KPI_BoTieuChiDonViService.ViewModels
{
    public class KPI_BoTieuChiDonViImportVM
    {
        public Guid? IdDonVi { get; set; }
        public Guid? IdDot { get; set; }
        public DateTime? ApDungTuNgay { get; set; }
        public DateTime? ApDungToiNgay { get; set; }
        public string? TenBoTieuChiDonVi { get; set; }
        public int RowStart { get; set; } = 3;
        public int? RowName { get; set; } = 1;
        public string? SoQuyetDinh { get; set; }
        public DateTime? NgayQuyetDinh { get; set; }
        public int? RowInfo { get; set; } = 2;
        public int TotalColumns { get; set; } = 7;
        public int StartCol { get; set; } = 1;
        public string? WorkSheetName { get; set; }
        public string? ImportMode { get; set; }
        public List<HeaderInfoVM> ColumnHeaderList { get; set; } = new List<HeaderInfoVM>();
    }

    public class HeaderInfoVM
    {
        public string? Name { get; set; }
        public int Row { get; set; }
        public int Col { get; set; }
    }
}
