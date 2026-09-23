using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;

namespace Hinet.Service.KPI_LyLich2CService.Dto
{
    public class KPI_LyLich2CDto : KPI_LyLich2C
    {
        public string? ChucVuHienTaiName { get; set; }
        public int ChucVuHienTaiPriority { get; set; }
        public string? TrinhDoMaxName { get; set; }
        public string? LyLuanChinhTriName { get; set; }
        public string? LoaiHopDongName { get; set; }
        public string? DonViSuDungName { get; set; }
        public long? DonViSuDungPriority { get; set; }
        public string? PhongBanName { get; set; }
        public long? PhongBanPriority { get; set; }
        public string? UserName { get; set; }
        public List<string> RoleCodes { get; set; } = new();
        public List<string> RoleNames { get; set; } = new();
    }
}
