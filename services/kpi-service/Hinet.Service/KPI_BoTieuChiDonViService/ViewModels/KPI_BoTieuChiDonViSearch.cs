using Hinet.Service.Dto;

namespace Hinet.Service.KPI_BoTieuChiDonViService.Dto
{
    public class KPI_BoTieuChiDonViSearch : SearchBase
    {
        public string? SoQuyetDinh { get; set; }
        public string? TenBoTieuChiDonVi { get; set; }
        public Guid? IdDonVi { get; set; }
        public List<Guid>? ListIdDonVi { get; set; }
        public Guid? IdDot { get; set; }
        public DateTime? ApDungTuNgayFrom { get; set; }
        public DateTime? ApDungTuNgayTo { get; set; }
        public DateTime? ApDungToiNgayFrom { get; set; }
        public DateTime? ApDungToiNgayTo { get; set; }
        public bool? Is_locked { get; set; }
    }
}
