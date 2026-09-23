using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_TieuChiChung_DiemSoRepository
{
    public class KPI_TieuChiChung_DiemSoRepository : Repository<KPI_TieuChiChung_DiemSo>, IKPI_TieuChiChung_DiemSoRepository
    {
        public KPI_TieuChiChung_DiemSoRepository(DbContext context) : base(context)
        {
        }
    }
}
