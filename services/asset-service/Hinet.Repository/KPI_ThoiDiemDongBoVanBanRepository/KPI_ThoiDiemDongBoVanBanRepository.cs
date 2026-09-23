using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_ThoiDiemDongBoVanBanRepository
{
    public class KPI_ThoiDiemDongBoVanBanRepository : Repository<KPI_ThoiDiemDongBoVanBan>, IKPI_ThoiDiemDongBoVanBanRepository
    {
        public KPI_ThoiDiemDongBoVanBanRepository(DbContext context) : base(context)
        {
        }
    }
}
