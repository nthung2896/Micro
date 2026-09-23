using Hinet.Service.Common;
using Hinet.Service.Dto;

namespace Hinet.Service.KPI_CauHinhDiemTheoHeSoLanhDaoService.Dto
{
    public class KPI_CauHinhDiemTheoHeSoLanhDaoSearch : SearchBase
    {
        public string? ChucVu { get; set; }
        public decimal? HeSo { get; set; }
        public Guid? IdBoTieuChi { get; set; }
        public Guid? IdDotDanhGia { get; set; }
        public Guid? IdDonVi { get; set; }
    }
}
