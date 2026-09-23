using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_DauRaNhiemVuRepository
{
    public class KPI_DauRaNhiemVuRepository : Repository<KPI_DauRaNhiemVu>, IKPI_DauRaNhiemVuRepository
    {
        public KPI_DauRaNhiemVuRepository(DbContext context) : base(context)
        {
        }
    }
}
