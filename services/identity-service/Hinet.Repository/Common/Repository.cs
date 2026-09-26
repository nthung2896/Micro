using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;

namespace Hinet.Repository
{
    public interface IRepository<T> where T : class, IAuditableEntity
    {
        Task<T?> GetByIdAsync(Guid? id);
        IEnumerable<T> GetAll();
        IQueryable<T> GetQueryable(bool isDelete = true);
        IQueryable<T> GetQueryableWithTracking();
        IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate);
        IQueryable<T> Where(Expression<Func<T, bool>> predicate);
        T Add(T entity);
        T Delete(T entity);
        void Update(T entity);
        Task SaveAsync();
        void Delete(IEnumerable<T> entities);
        void AddRange(IEnumerable<T> entities);
        Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
    }

    public class Repository<T> : IRepository<T> where T : class, IAuditableEntity
    {
        protected readonly IdentityContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(IdentityContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<T?> GetByIdAsync(Guid? id)
        {
            if (id == null) return null;
            return await _dbSet.FirstOrDefaultAsync(x => x.Id == id.Value && !x.IsDeleted);
        }

        public virtual IEnumerable<T> GetAll()
        {
            return _dbSet.Where(x => !x.IsDeleted).AsEnumerable();
        }

        public virtual IQueryable<T> GetQueryable(bool isDelete = true)
        {
            return isDelete ? _dbSet.Where(x => !x.IsDeleted).AsNoTracking() : _dbSet.AsNoTracking();
        }

        public virtual IQueryable<T> GetQueryableWithTracking()
        {
            return _dbSet.Where(x => !x.IsDeleted);
        }

        public virtual IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate)
        {
            return _dbSet.Where(x => !x.IsDeleted).Where(predicate).AsEnumerable();
        }

        public virtual IQueryable<T> Where(Expression<Func<T, bool>> predicate)
        {
            return _dbSet.Where(x => !x.IsDeleted).Where(predicate);
        }

        public virtual T Add(T entity)
        {
            entity.CreatedDate = DateTime.UtcNow;
            entity.IsDeleted = false;
            return _dbSet.Add(entity).Entity;
        }

        public virtual T Delete(T entity)
        {
            entity.IsDeleted = true;
            entity.DeleteDate = DateTime.UtcNow;
            _dbSet.Update(entity);
            return entity;
        }

        public virtual void Update(T entity)
        {
            entity.UpdatedDate = DateTime.UtcNow;
            _dbSet.Update(entity);
        }

        public virtual async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }

        public virtual void Delete(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                entity.IsDeleted = true;
                entity.DeleteDate = DateTime.UtcNow;
            }
            _dbSet.UpdateRange(entities);
        }

        public virtual void AddRange(IEnumerable<T> entities)
        {
            foreach (var entity in entities)
            {
                entity.CreatedDate = DateTime.UtcNow;
                entity.IsDeleted = false;
            }
            _dbSet.AddRange(entities);
        }

        public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.Where(x => !x.IsDeleted).AnyAsync(predicate);
        }
    }
}
