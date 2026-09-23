using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_TieuChiChungRepository
{
    public class KPI_TieuChiChungRepository : Repository<KPI_TieuChiChung>, IKPI_TieuChiChungRepository
    {
        public KPI_TieuChiChungRepository(DbContext context) : base(context)
        {
        }
    }
}
