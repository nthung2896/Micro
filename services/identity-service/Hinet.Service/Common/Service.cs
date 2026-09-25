using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Hinet.Model.Entities;
using Hinet.Repository;

namespace Hinet.Service.Common
{
    public interface IService<T> where T : class, IAuditableEntity
    {
        Task<T?> GetByIdAsync(Guid? id);
        IEnumerable<T> GetAll();
        IQueryable<T> GetQueryable(bool isDelete = true);
        IQueryable<T> Where(Expression<Func<T, bool>> predicate);
        T Add(T entity);
        T Delete(T entity);
        void Update(T entity);
        Task SaveAsync();
        void Delete(IEnumerable<T> entities);
        void AddRange(IEnumerable<T> entities);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
    }

    public class Service<T> : IService<T> where T : class, IAuditableEntity
    {
        protected readonly IRepository<T> _repository;

        public Service(IRepository<T> repository)
        {
            _repository = repository;
        }

        public virtual async Task<T?> GetByIdAsync(Guid? id) => await _repository.GetByIdAsync(id);
        public virtual IEnumerable<T> GetAll() => _repository.GetAll();
        public virtual IQueryable<T> GetQueryable(bool isDelete = true) => _repository.GetQueryable(isDelete);
        public virtual IQueryable<T> Where(Expression<Func<T, bool>> predicate) => _repository.Where(predicate);
        public virtual T Add(T entity) => _repository.Add(entity);
        public virtual T Delete(T entity) => _repository.Delete(entity);
        public virtual void Update(T entity) => _repository.Update(entity);
        public virtual async Task SaveAsync() => await _repository.SaveAsync();
        public virtual void Delete(IEnumerable<T> entities) => _repository.Delete(entities);
        public virtual void AddRange(IEnumerable<T> entities) => _repository.AddRange(entities);
        public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate) => await _repository.AnyAsync(predicate);
    }
}
