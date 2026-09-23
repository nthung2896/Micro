using Hinet.FileServer.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hinet.FileServer.Model
{
    public class HinetContext : DbContext
    {
        public HinetContext(DbContextOptions<HinetContext> options) : base(options)
        {

        }

        public DbSet<AppUser> AppUser { get; set; }
        public DbSet<TaiLieuDinhKem> TaiLieuDinhKem { get; set; }




    }
}