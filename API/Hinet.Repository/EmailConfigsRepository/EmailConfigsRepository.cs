using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.EmailConfigsRepository
{
    public class EmailConfigsRepository : Repository<EmailConfigs>, IEmailConfigsRepository
    {
        public EmailConfigsRepository(DbContext context) : base(context)
        {
        }
    }
}
