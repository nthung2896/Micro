using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;


namespace Hinet.Repository.DepartmentRepository
{
    public class DepartmentRepository : Repository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(DbContext context) : base(context)
        {
        }


        public async Task<List<Department>> GetByParentIdAsync(Guid? parentId)
        {
            return await GetQueryable()
                .Where(d => d.ParentId == parentId)
                .OrderBy(d => d.Priority)
                .ToListAsync();
        }
    }
}
