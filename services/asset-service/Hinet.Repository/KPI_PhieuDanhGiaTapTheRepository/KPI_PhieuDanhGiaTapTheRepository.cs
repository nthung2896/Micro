using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_PhieuDanhGiaTapTheRepository
{
    public class KPI_PhieuDanhGiaTapTheRepository : Repository<KPI_PhieuDanhGiaTapThe>, IKPI_PhieuDanhGiaTapTheRepository
    {
        public KPI_PhieuDanhGiaTapTheRepository(DbContext context) : base(context)
        {
        }
    }
}
