using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.AspNetUsersRepository
{
    public class AspNetUsersRepository : Repository<AppUser>, IAspNetUsersRepository
    {
        public AspNetUsersRepository(DbContext context) : base(context)
        {
        }
    }
}
