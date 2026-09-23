using Hinet.Model;
using Hinet.Model.Entities;
using Hinet.Model.MongoEntities.Common;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Repository.Common
{
    public class MongoRepository<T> : IMongoRepository<T>
        where T : class, IMEntity
    {
        protected readonly IMongoCollection<T> _collection;
        private readonly HinetMongoContext _context;

        public MongoRepository(HinetMongoContext context)
        {
            var collectionName = typeof(T).Name;
            _collection = context.Database.GetCollection<T>(collectionName);
            this._context = context;
        }

        public virtual IMongoCollection<T> Collection()
        {
            return _collection;
        }

        public virtual IQueryable<T> GetQueryable()
        {
            return _collection.AsQueryable();
        }

        public async Task<IEnumerable<T>> FindBy(Expression<Func<T, bool>> predicate)
        {
            return await _collection.Find(predicate).ToListAsync();
        }

        public virtual async Task<T> CreateAsync(T entity)
        {

            _context.AuditFields(entity);

            await _collection.InsertOneAsync(entity);
            return entity;
        }

        public virtual async Task<IEnumerable<T>> CreateAsync(IEnumerable<T> entities)
        {
            _context.AuditFields(entities);
            await _collection.InsertManyAsync(entities);
            return entities;
        }
        public virtual async Task<T> DeleteAsync(T entity)
        {
            var filter = Builders<T>.Filter.Eq(e => e.Id, entity.Id);
            return await _collection.FindOneAndDeleteAsync(filter);
        }
        public virtual async Task<T> UpdateAsync(T entity)
        {
            _context.AuditFields(entity);
            var filter = Builders<T>.Filter.Eq(e => e.Id, entity.Id);
            await _collection.ReplaceOneAsync(filter, entity);
            return entity;
        }
        public virtual async Task<IEnumerable<T>> UpdateAsync(IEnumerable<T> entities)
        {
            _context.AuditFields(entities);

            var bulkOps = new List<WriteModel<T>>();
            foreach (var entity in entities)
            {
                var filter = Builders<T>.Filter.Eq(e => e.Id, entity.Id);
                var updateOne = new ReplaceOneModel<T>(filter, entity);
                bulkOps.Add(updateOne);
            }
            if (bulkOps.Count > 0)
            {
                await _collection.BulkWriteAsync(bulkOps);
            }
            return entities;
        }
        public async Task<T?> GetByIdAsync(string id)
        {
            var filter = Builders<T>.Filter.Eq("Id", id);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }
        public async Task DeleteAsync(IEnumerable<T> entities)
        {
            var ids = entities.Select(e => e.Id);
            var filter = Builders<T>.Filter.In(e => e.Id, ids);
            await _collection.DeleteManyAsync(filter);
        }
    }
}
