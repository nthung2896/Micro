using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.EmailTemplatesRepository
{
    public class EmailTemplatesRepository : Repository<EmailTemplates>, IEmailTemplatesRepository
    {
        public EmailTemplatesRepository(DbContext context) : base(context)
        {
        }
    }
}
