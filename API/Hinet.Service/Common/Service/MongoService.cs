using Hinet.Model.MongoEntities.Common;
using Hinet.Repository.Common;
using Hinet.Service.Common.Dtos;
using MongoDB.Driver.Linq;
using System.ComponentModel;
using System.Linq.Expressions;
using System.Reflection;

namespace Hinet.Service.Common.Service
{
    public class MongoService<T> : IMongoService<T> where T : IMEntity
    {
        private readonly IMongoRepository<T> _repository;
        public MongoService(IMongoRepository<T> repository)
        {
            _repository = repository;
        }

        public virtual async Task<T?> GetByIdAsync(string? id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return default;
                }
                return await _repository.GetByIdAsync(id);

            }
            catch (Exception)
            {
                return default;
            }

        }
        public async Task<T> GetByIdOrThrowAsync(string? id)
        {
            var entity = await GetByIdAsync(id);
            if (entity == null)
            {
                string entityName = typeof(T).Name;
                var displayNameAttribute = typeof(T).GetCustomAttribute<DisplayNameAttribute>();
                if (displayNameAttribute != null)
                {
                    entityName = displayNameAttribute.DisplayName;
                }
                throw new Exception($"Không tìm thấy {entityName} với Id {id}");
            }
            return entity;
        }
        public virtual async Task CreateAsync(T entity)
        {
            await _repository.CreateAsync(entity);
        }

        public virtual async Task CreateAsync(IEnumerable<T> entities)
        {
            await _repository.CreateAsync(entities);
        }

        public virtual async Task UpdateAsync(T entity)
        {
            await _repository.UpdateAsync(entity);
        }

        public virtual async Task UpdateAsync(IEnumerable<T> entities)
        {
            await _repository.UpdateAsync(entities);
        }
        public async Task DeleteAsync(T entity)
        {
            await _repository.DeleteAsync(entity);
        }
        public async Task DeleteAsync(IEnumerable<T> entities)
        {
            await _repository.DeleteAsync(entities);
        }
        public IQueryable<T> GetQueryable()
        {
            return _repository.GetQueryable();
        }

        public IQueryable<T> Where(Expression<Func<T, bool>> predicate)
        {
            return _repository.GetQueryable().Where(predicate);
        }
        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
        {
            return await _repository.GetQueryable().FirstOrDefaultAsync(predicate);
        }
        public async Task<int> Count(Expression<Func<T, bool>> predicate)
        {
            return await _repository.GetQueryable().CountAsync(predicate);
        }

        public async Task<List<SelectAntd>> GetDropDown(string labelField, string valueField)
        {
            var query = _repository.GetQueryable();
            var param = Expression.Parameter(typeof(T), "t");

            // Lấy thuộc tính cho Label
            var labelProperty = Expression.PropertyOrField(param, labelField);
            var labelToString = Expression.Condition(
                Expression.Equal(labelProperty, Expression.Constant(null)), // Nếu null
                Expression.Constant(""), // Gán chuỗi rỗng
                Expression.Call(labelProperty, typeof(object).GetMethod("ToString") ?? throw new InvalidOperationException())
            );

            // Lấy thuộc tính cho Value (giữ nguyên kiểu dữ liệu gốc)
            var valueProperty = Expression.PropertyOrField(param, valueField);
            var valueConvert = Expression.Convert(valueProperty, typeof(object));

            // Biểu thức Lambda cho Select
            var selectExpression = Expression.Lambda<Func<T, SelectAntd>>(
                Expression.MemberInit(
                    Expression.New(typeof(SelectAntd)),
                    Expression.Bind(typeof(SelectAntd).GetProperty("Label"), labelToString),
                    Expression.Bind(typeof(SelectAntd).GetProperty("Value"), valueConvert) // Không dùng ToString()
                ),
                param
            );

            return await query.Select(selectExpression).ToListAsync();
        }


    }
}
