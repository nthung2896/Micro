using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_BoTieuChiDonViRepository
{
    public class KPI_BoTieuChiDonViRepository : Repository<KPI_BoTieuChiDonVi>, IKPI_BoTieuChiDonViRepository
    {
        public KPI_BoTieuChiDonViRepository(DbContext context) : base(context)
        {
        }
    }
}
