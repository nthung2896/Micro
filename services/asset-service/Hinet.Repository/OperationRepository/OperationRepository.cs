using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.OperationRepository
{
    public class OperationRepository : Repository<Operation>, IOperationRepository
    {
        public OperationRepository(DbContext context) : base(context)
        {
        }
    }
}
