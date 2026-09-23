using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.ModuleRepository
{
    public class ModuleRepository : Repository<Module>, IModuleRepository
    {
        public ModuleRepository(DbContext context) : base(context)
        {
        }
    }
}
