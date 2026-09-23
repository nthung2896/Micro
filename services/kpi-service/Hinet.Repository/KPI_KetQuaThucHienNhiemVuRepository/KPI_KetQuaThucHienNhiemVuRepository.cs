using Hinet.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Repository.KPI_KetQuaThucHienNhiemVuRepository
{
    public class KPI_KetQuaThucHienNhiemVuRepository : Repository<KPI_KetQuaThucHienNhiemVu>, IKPI_KetQuaThucHienNhiemVuRepository
    {
        public KPI_KetQuaThucHienNhiemVuRepository(DbContext context) : base(context)
        {
        }
    }
}
