using Hinet.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Repository.AppUserRepository
{
    public class AppUserRepository : Repository<AppUser>, IAppUserRepository
    {
        public AppUserRepository(DbContext context) : base(context)
        {

        }
    }
}
