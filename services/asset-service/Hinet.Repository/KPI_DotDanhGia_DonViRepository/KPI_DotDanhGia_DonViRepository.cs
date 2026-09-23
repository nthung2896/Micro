using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_DotDanhGia_DonViRepository
{
    public class KPI_DotDanhGia_DonViRepository : Repository<KPI_DotDanhGia_DonVi>, IKPI_DotDanhGia_DonViRepository
    {
        public KPI_DotDanhGia_DonViRepository(DbContext context) : base(context)
        {
        }
    }
}
