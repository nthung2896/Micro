using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;
using Hinet.Repository.Common;

namespace Hinet.Repository.KPI_CauHinhCongThucNhiemVuRepository
{
    public class KPI_CauHinhCongThucNhiemVuRepository : Repository<KPI_CauHinhCongThucNhiemVu>, IKPI_CauHinhCongThucNhiemVuRepository
    {
        public KPI_CauHinhCongThucNhiemVuRepository(DbContext context) : base(context)
        {
        }
    }
}
