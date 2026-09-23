using Hinet.Model.Entities;

namespace Hinet.Repository.DepartmentRepository
{
    public interface IDepartmentRepository : IRepository<Department>
    {

        Task<List<Department>> GetByParentIdAsync(Guid? parentId);
    }
}
