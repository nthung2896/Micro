using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_BoTieuChiChungRepository
{
    public class KPI_BoTieuChiChungRepository : Repository<KPI_BoTieuChiChung>, IKPI_BoTieuChiChungRepository
    {
        public KPI_BoTieuChiChungRepository(DbContext context) : base(context)
        {
        }
    }
}
