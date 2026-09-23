using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_PhieuDanhGiaTapTheService.Dto
{
    public class KPI_TieuChiTapTheTreeDto
    {
        public Guid Id { get; set; }
        public string Ten { get; set; } = string.Empty;
        public Guid? ParentId { get; set; }
        public decimal? DiemToiDa { get; set; }
        public int? Priority { get; set; }
        public Guid? IdBoTieuChi { get; set; }
        public string? TenBoTieuChi { get; set; }
        public string Stt { get; set; } = string.Empty;
        public decimal? DiemTuCham { get; set; }
        public decimal? DiemCapTren { get; set; }
        public string? GhiChu { get; set; }
        public List<KPI_TieuChiTapTheTreeDto> Children { get; set; } = new List<KPI_TieuChiTapTheTreeDto>();
    }
}
