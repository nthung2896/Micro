using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.TaiLieuDinhKemRepository
{
    public class TaiLieuDinhKemRepository : Repository<TaiLieuDinhKem>, ITaiLieuDinhKemRepository
    {
        public TaiLieuDinhKemRepository(DbContext context) : base(context)
        {
        }
    }
}
