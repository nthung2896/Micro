using Microsoft.EntityFrameworkCore;
using Hinet.Model.Entities;
using System.Linq.Expressions;

namespace Hinet.Repository
{
    public class Repository<T> : IRepository<T> where T : class, IAuditableEntity
    {
        protected DbContext _entities;
        protected readonly DbSet<T> _dbset;

        public Repository(DbContext context)
        {
            _entities = context;
            _dbset = context.Set<T>();
        }

        public virtual DbSet<T> DBSet()
        {
            return _dbset;
        }

        public async Task<T?> GetByIdAsync(Guid? id)
        {
            return await _dbset.FindAsync(id);
        }
        public virtual IEnumerable<T> GetAll()
        {
            return _dbset.AsEnumerable<T>();
        }
        public virtual IQueryable<T> GetQueryable(bool isDelete = true)
        {
            if (isDelete)
            {
                return _dbset.AsNoTracking().AsQueryable().Where(x => x.IsDeleted != isDelete);
            }
            return _dbset.AsNoTracking().AsQueryable();
        }
        public virtual IQueryable<T> GetQueryableWithTracking()
        {
            return _dbset.AsQueryable().Where(x => x.IsDeleted != true);
        }
        public IQueryable<T> Where(Expression<Func<T, bool>> predicate)
        {
            return GetQueryable().Where(predicate);
        }

        public virtual T Add(T entity)
        {
            return _dbset.Add(entity).Entity;
        }


        public void AddRange(IEnumerable<T> entities)
        {
            _entities.Set<T>().AddRange(entities);
        }



        public virtual void Update(T entity)
        {
            _entities.Entry(entity).State = EntityState.Modified;
        }



        public virtual T Delete(T entity)
        {
            return _dbset.Remove(entity).Entity;
        }

        public void Delete(IEnumerable<T> entities)
        {
            foreach (var item in entities)
            {
                if (_entities.Entry(item).State == EntityState.Detached)
                {
                    _dbset.Attach(item);
                }
                _dbset.Remove(item);
            }
        }


        public virtual async Task SaveAsync()
        {
            await _entities.SaveChangesAsync();
        }

        public Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        {
            return GetQueryable().AnyAsync(predicate);
        }



        public IEnumerable<T> FindBy(Expression<Func<T, bool>> predicate)
        {
            IEnumerable<T> query = GetQueryable().Where(predicate).AsEnumerable();
            return query;
        }
    }
}
