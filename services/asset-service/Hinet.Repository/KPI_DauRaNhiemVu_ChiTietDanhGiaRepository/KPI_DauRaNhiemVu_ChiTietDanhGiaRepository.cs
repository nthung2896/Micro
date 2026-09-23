using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_DauRaNhiemVu_ChiTietDanhGiaRepository
{
    public class KPI_DauRaNhiemVu_ChiTietDanhGiaRepository : Repository<KPI_DauRaNhiemVu_ChiTietDanhGia>, IKPI_DauRaNhiemVu_ChiTietDanhGiaRepository
    {
        public KPI_DauRaNhiemVu_ChiTietDanhGiaRepository(DbContext context) : base(context)
        {
        }
    }
}
