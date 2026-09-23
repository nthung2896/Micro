using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_NhiemVuRepository
{
    public class KPI_NhiemVuRepository : Repository<KPI_NhiemVu>, IKPI_NhiemVuRepository
    {
        public KPI_NhiemVuRepository(DbContext context) : base(context)
        {
        }
    }
}
