using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.AppConfigurationRepository
{
    public class AppConfigurationRepository : Repository<AppConfiguration>, IAppConfigurationRepository
    {
        public AppConfigurationRepository(DbContext context) : base(context)
        {
        }
    }
}
