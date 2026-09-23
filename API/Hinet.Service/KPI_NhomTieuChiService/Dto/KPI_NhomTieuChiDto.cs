using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;

namespace Hinet.Service.KPI_NhomTieuChiService.Dto
{
    public class KPI_NhomTieuChiDto : KPI_NhomTieuChi
    {
        public string? Level1Name { get; set; }
        public string? Level2Name { get; set; }
        public string? Level3Name { get; set; }
        public string? Level4Name { get; set; }
        public string? Level5Name { get; set; }
        public string? TenNhomTieuChiKhongDau { get; set; }
        public string? CongViecChiTietKhongDau { get; set; }
        public string? SanPhamDauRaKhongDau { get; set; }
        public string? SyncVersion { get; set; }
    }

    public class KPI_NhomTieuChiDtoV2 : KPI_NhomTieuChi
    {
        public string? Level1Name { get; set; }
        public string? Level2Name { get; set; }
        public string? Level3Name { get; set; }
        public string? Level4Name { get; set; }
        public string? Level5Name { get; set; }
        public List<KPI_NhiemVuDto> kPI_NhiemVuDtos { get; set; }
    }

    public class KPI_NhiemVuDto : KPI_NhiemVu
    {
        public List<KPI_DauRaNhiemVuDto> kPI_DauRaNhiemVuDtos { get; set; }
    }

    public class KPI_DauRaNhiemVuDto : KPI_DauRaNhiemVu
    {
        
    }

}
