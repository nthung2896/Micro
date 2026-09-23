using System;
using System.Collections.Generic;
using Hinet.Model.Entities;

namespace Hinet.Service.KPI_BoTieuChiChungService.Dto
{
    public class ImportExcelResultDto
    {
        public bool Status { get; set; } = true;
        public string? Message { get; set; }
        public int TotalSuccess { get; set; }
        public int TotalFailed { get; set; }
        public List<KPI_TieuChiChung> ListTrue { get; set; } = new List<KPI_TieuChiChung>();
        public List<object> LstFalse { get; set; } = new List<object>();
        public KPI_BoTieuChiChung? BoTieuChi { get; set; }
    }
}
