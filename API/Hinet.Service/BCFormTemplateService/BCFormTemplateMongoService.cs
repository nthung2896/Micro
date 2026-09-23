using Hinet.Model;
using Hinet.Model.MongoEntities;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Hinet.Service.BCFormTemplateService
{
    public class BCFormTemplateMongoService : IBCFormTemplateMongoService
    {
        private readonly HinetMongoContext _mongoContext;
        private readonly IMongoCollection<BCFormTemplate> _collection;

        public BCFormTemplateMongoService(HinetMongoContext mongoContext)
        {
            _mongoContext = mongoContext;
            _collection = mongoContext.GetCollection<BCFormTemplate>();
        }

        public async Task<BCFormTemplate?> GetByIdAsync(string id)
        {
            var filter = Builders<BCFormTemplate>.Filter.Eq(x => x.Id, id);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<BCFormTemplate?> GetByBaoCaoIdAsync(string baoCaoId)
        {
            var filter = Builders<BCFormTemplate>.Filter.Eq("IdBaoCao", baoCaoId);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<BCFormTemplate> SaveTemplateAsync(BCFormTemplate template, string username, string userId)
        {
            if (string.IsNullOrEmpty(template.Id))
            {
                template.Id = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 24); // Tách thành 24 kí tự hợp chuẩn ObjectId
                template.CreatedDate = DateTime.Now;
                template.CreatedBy = username;
                template.CreatedId = userId;
                template.UpdatedDate = DateTime.Now;
                template.UpdatedBy = username;
                template.UpdatedId = userId;

                await _collection.InsertOneAsync(template);
            }
            else
            {
                var filter = Builders<BCFormTemplate>.Filter.Eq(x => x.Id, template.Id);
                var existing = await _collection.Find(filter).FirstOrDefaultAsync();
                if (existing == null)
                {
                    template.CreatedDate = DateTime.Now;
                    template.CreatedBy = username;
                    template.CreatedId = userId;
                    template.UpdatedDate = DateTime.Now;
                    template.UpdatedBy = username;
                    template.UpdatedId = userId;

                    await _collection.InsertOneAsync(template);
                }
                else
                {
                    template.CreatedDate = existing.CreatedDate;
                    template.CreatedBy = existing.CreatedBy;
                    template.CreatedId = existing.CreatedId;
                    template.UpdatedDate = DateTime.Now;
                    template.UpdatedBy = username;
                    template.UpdatedId = userId;

                    await _collection.ReplaceOneAsync(filter, template);
                }
            }

            return template;
        }

        public async Task<List<BCFormTemplate>> GetAllTemplatesAsync()
        {
            return await _collection.Find(_ => true).ToListAsync();
        }
    }
}
