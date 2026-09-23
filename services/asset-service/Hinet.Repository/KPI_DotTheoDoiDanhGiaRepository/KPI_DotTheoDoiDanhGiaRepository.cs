using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.KPI_DotTheoDoiDanhGiaRepository
{
    public class KPI_DotTheoDoiDanhGiaRepository : Repository<KPI_DotTheoDoiDanhGia>, IKPI_DotTheoDoiDanhGiaRepository
    {
        public KPI_DotTheoDoiDanhGiaRepository(DbContext context) : base(context)
        {
        }
    }
}
