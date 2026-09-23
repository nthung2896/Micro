using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_NhomTieuChiRepository
{
    public class KPI_NhomTieuChiRepository : Repository<KPI_NhomTieuChi>, IKPI_NhomTieuChiRepository
    {
        public KPI_NhomTieuChiRepository(DbContext context) : base(context)
        {
        }
    }
}
