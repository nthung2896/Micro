using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_PhieuDanhGiaRepository
{
    public class KPI_PhieuDanhGiaRepository : Repository<KPI_PhieuDanhGia>, IKPI_PhieuDanhGiaRepository
    {
        public KPI_PhieuDanhGiaRepository(DbContext context) : base(context)
        {
        }
    }
}
