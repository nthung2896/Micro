using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository.LegalDocumentRepository
{
    public class LegalDocumentRepository : Repository<LegalDocument>, ILegalDocumentRepository
    {
        public LegalDocumentRepository(DbContext context) : base(context)
        {
        }
    }
}
