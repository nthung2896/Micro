using Hinet.Model.MongoEntities.Common;
using System.Linq.Expressions;
using MongoDB.Driver.Linq;
using System.Linq;
using MongoDB.Driver;
namespace Hinet.Repository.Common
{
    public interface IMongoRepository<T> where T : IMEntity
    {
        IMongoCollection<T> Collection();
        IQueryable<T> GetQueryable();
        Task<IEnumerable<T>> FindBy(Expression<Func<T, bool>> predicate);
        Task<T> CreateAsync(T entity);
        Task<IEnumerable<T>> CreateAsync(IEnumerable<T> entities);
        Task<T> UpdateAsync(T entity);
        Task<IEnumerable<T>> UpdateAsync(IEnumerable<T> entities);
        Task<T> DeleteAsync(T entity);
        Task<T?> GetByIdAsync(string id);
        Task DeleteAsync(IEnumerable<T> entities);
    }
}
