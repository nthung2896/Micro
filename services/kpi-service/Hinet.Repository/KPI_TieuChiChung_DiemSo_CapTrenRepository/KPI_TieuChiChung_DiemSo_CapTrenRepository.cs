using Hinet.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Repository.KPI_TieuChiChung_DiemSo_CapTrenRepository
{
    public class KPI_TieuChiChung_DiemSo_CapTrenRepository : Repository<KPI_TieuChiChung_DiemSo_CapTren>, IKPI_TieuChiChung_DiemSo_CapTrenRepository
    {
        public KPI_TieuChiChung_DiemSo_CapTrenRepository(DbContext context) : base(context)
        {
        }
    }
}
