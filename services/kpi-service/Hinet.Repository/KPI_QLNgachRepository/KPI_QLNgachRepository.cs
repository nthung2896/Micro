using Hinet.Model;
using Hinet.Model.Entities;
using Hinet.Repository.Common;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Repository.KPI_QLNgachRepository
{
    public class KPI_QLNgachRepository : Repository<KPI_QLNgach>, IKPI_QLNgachRepository
    {
        public KPI_QLNgachRepository(DbContext context) : base(context)
        {
        }
    }
}
