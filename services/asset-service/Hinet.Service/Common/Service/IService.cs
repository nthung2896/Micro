using Hinet.Model.Entities;
using System.Linq.Expressions;
using Hinet.Service.Dto;

namespace Hinet.Service.Common.Service
{
    public interface IService<T> where T : class, IAuditableEntity
    {
        Task<T?> GetByIdAsync(Guid? id);
        Task<T> GetByIdOrThrowAsync(Guid? guid);
        Task CreateAsync(T entity);
        Task CreateAsync(IEnumerable<T> entities);
        Task UpdateAsync(T entity);
        Task UpdateAsync(IEnumerable<T> entities);
        Task DeleteAsync(T entity);
        IQueryable<T> GetQueryable(bool isDelete = true);
        Task DeleteAsync(IEnumerable<T> entities);
        IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
        IQueryable<T> Where(Expression<Func<T, bool>> predicate);
        void Delete(Expression<Func<T, bool>> filter);
        Task DeleteRange(IEnumerable<T> entities);
        Task<List<DropdownOption>> GetDropdownOptions<TField, TValue>(Expression<Func<T, TField>> displayField, Expression<Func<T, TValue>> valueField, TValue? selected = default);
        Task CreateRange(IEnumerable<T> entities);
    }
}
