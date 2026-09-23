using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_VanBanDenRepository
{
    public class KPI_VanBanDenRepository : Repository<KPI_VanBanDen>, IKPI_VanBanDenRepository
    {
        public KPI_VanBanDenRepository(DbContext context) : base(context)
        {
        }
    }
}
