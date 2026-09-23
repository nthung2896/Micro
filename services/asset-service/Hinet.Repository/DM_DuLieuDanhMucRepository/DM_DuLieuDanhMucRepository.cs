using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.DM_DuLieuDanhMucRepository
{
    public class DM_DuLieuDanhMucRepository : Repository<DM_DuLieuDanhMuc>, IDM_DuLieuDanhMucRepository
    {
        public DM_DuLieuDanhMucRepository(DbContext context) : base(context)
        {
        }
    }
}
