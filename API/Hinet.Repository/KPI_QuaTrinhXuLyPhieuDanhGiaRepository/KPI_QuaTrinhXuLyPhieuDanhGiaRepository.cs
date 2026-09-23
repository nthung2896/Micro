using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.KPI_QuaTrinhXuLyPhieuDanhGiaRepository
{
    public class KPI_QuaTrinhXuLyPhieuDanhGiaRepository : Repository<KPI_QuaTrinhXuLyPhieuDanhGia>, IKPI_QuaTrinhXuLyPhieuDanhGiaRepository
    {
        public KPI_QuaTrinhXuLyPhieuDanhGiaRepository(DbContext context) : base(context)
        {
        }
    }
}
