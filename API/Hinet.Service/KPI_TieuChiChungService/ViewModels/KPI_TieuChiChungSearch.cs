using System;
using Hinet.Service.Dto;

namespace Hinet.Service.KPI_TieuChiChungService.Dto
{
    public class KPI_TieuChiChungSearch : SearchBase
    {
        public string? Ten { get; set; }
		public string? ParentId { get; set; }
		public decimal? MyProperty { get; set; }
		public Guid? IdBoTieuChiChung { get; set; }
    }
}
