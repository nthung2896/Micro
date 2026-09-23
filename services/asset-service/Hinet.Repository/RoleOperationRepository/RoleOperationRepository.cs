using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.RoleOperationRepository
{
    public class RoleOperationRepository : Repository<RoleOperation>, IRoleOperationRepository
    {
        public RoleOperationRepository(DbContext context) : base(context)
        {
        }
    }
}
