using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;

namespace Hinet.Service.KPI_DotDanhGia_DonViService.Dto
{
    public class KPI_DotDanhGia_DonViDto : KPI_DotDanhGia_DonVi
    {
        public string? TenDonVi { get; set; }
        public string? TenDotDanhGia { get; set; }
        public string? TenBoChiSoNhiemVu { get; set; }
        public string? TenBoTieuChiChung { get; set; }
        public string? SoQuyetDinhBoChiSoNhiemVu { get; set; }
        public string? SoQuyetDinhBoTieuChiChung { get; set; }
    }
}
