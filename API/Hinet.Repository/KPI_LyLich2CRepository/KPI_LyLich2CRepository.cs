using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.KPI_LyLich2CRepository
{
    public class KPI_LyLich2CRepository : Repository<KPI_LyLich2C>, IKPI_LyLich2CRepository
    {
        public KPI_LyLich2CRepository(DbContext context) : base(context)
        {
        }
    }
}
