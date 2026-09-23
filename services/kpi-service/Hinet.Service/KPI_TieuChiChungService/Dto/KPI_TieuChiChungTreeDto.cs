using System;
using System.Collections.Generic;

namespace Hinet.Service.KPI_TieuChiChungService.Dto
{
    public class KPI_TieuChiChungTreeDto
    {
        public Guid Id { get; set; }
        public string Ten { get; set; }
        public Guid? ParentId { get; set; }
        public decimal? MyProperty { get; set; }
        public int? Priority { get; set; }
        public Guid? IdBoTieuChiChung { get; set; }
        
        public string Stt { get; set; }
        public decimal? DiemTuCham { get; set; }
        
        public List<KPI_TieuChiChungTreeDto> Children { get; set; } = new List<KPI_TieuChiChungTreeDto>();
    }
}
