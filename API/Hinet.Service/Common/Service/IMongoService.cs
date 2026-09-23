using Hinet.Model.Entities;
using Hinet.Model.MongoEntities.Common;
using Hinet.Service.Common.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.Common.Service
{
    public interface IMongoService<T> where T : IMEntity
    {
        Task<T?> GetByIdAsync(string? id);
        Task<T> GetByIdOrThrowAsync(string? id);
        Task CreateAsync(T entity);
        Task CreateAsync(IEnumerable<T> entities);
        Task UpdateAsync(T entity);
        Task UpdateAsync(IEnumerable<T> entities);
        Task DeleteAsync(T entity);
        Task DeleteAsync(IEnumerable<T> entities);
        IQueryable<T> GetQueryable();
        IQueryable<T> Where(Expression<Func<T, bool>> predicate);
        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
        Task<int> Count(Expression<Func<T, bool>> predicate);

        Task<List<SelectAntd>> GetDropDown(string labelField, string valueField);
    }
}
