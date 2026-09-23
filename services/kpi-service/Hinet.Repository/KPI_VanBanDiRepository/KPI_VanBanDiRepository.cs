using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.KPI_VanBanDiRepository
{
    public class KPI_VanBanDiRepository : Repository<KPI_VanBanDi>, IKPI_VanBanDiRepository
    {
        public KPI_VanBanDiRepository(DbContext context) : base(context)
        {
        }
    }
}
