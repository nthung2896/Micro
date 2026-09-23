using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.AppInfoItemRepository
{
    public class AppInfoItemRepository : Repository<AppInfoItem>, IAppInfoItemRepository
    {
        public AppInfoItemRepository(DbContext context) : base(context)
        {
        }
    }
}
