using Hinet.Model.Entities;
using Hinet.Model.MongoEntities.Common;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using MongoDbGenericRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
namespace Hinet.Model
{
    public class HinetMongoContext : IMongoDbContext
    {
        public readonly IMongoDatabase Database;
        private readonly IMongoClient _client;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public HinetMongoContext(IMongoClient client, string databaseName, IHttpContextAccessor httpContextAccessor)
        {
            _client = client;
            Database = client.GetDatabase(databaseName);
            _httpContextAccessor = httpContextAccessor;
           
        }
        public IMongoClient Client => _client;

        IMongoDatabase IMongoDbContext.Database => Database;

        public void DropCollection<TDocument>(string? partitionKey = null)
        {
            Database.DropCollection(GetCollectionName<TDocument>());
        }

        public IMongoCollection<TDocument> GetCollection<TDocument>(string partitionKey = null)
        {
            return Database.GetCollection<TDocument>(GetCollectionName<TDocument>());
        }

        public void SetGuidRepresentation(GuidRepresentation guidRepresentation)
        {
            if (!BsonClassMap.IsClassMapRegistered(typeof(AuditableEntity)))
            {
                BsonClassMap.RegisterClassMap<AuditableEntity>(cm =>
                {
                    cm.AutoMap();
                    var standardGuidSerializer = new GuidSerializer(guidRepresentation);

                    cm.MapProperty(c => c.CreatedId).SetSerializer(new NullableSerializer<Guid>(standardGuidSerializer));
                    cm.MapProperty(c => c.UpdatedId).SetSerializer(new NullableSerializer<Guid>(standardGuidSerializer));
                    cm.MapProperty(c => c.DeletedId).SetSerializer(new NullableSerializer<Guid>(standardGuidSerializer));
                });
            }

            // Đăng ký serializer toàn cục cho Guid
            var existingSerializer = BsonSerializer.LookupSerializer<Guid>();
            if (existingSerializer is not GuidSerializer)
            {
                BsonSerializer.RegisterSerializer(new GuidSerializer(guidRepresentation));
            }
        }
        private void RegisterMongoConventions()
        {
            var pack = new ConventionPack
            {
                new CamelCaseElementNameConvention(),
                new IgnoreIfNullConvention(true)
            };

            ConventionRegistry.Register(
                "HinetProjectConventions",
                pack,
                t => true // Áp dụng cho tất cả các kiểu dữ liệu (hoặc t => t.Namespace.StartsWith("Hinet"))
            );
        }
        private string GetCollectionName<TDocument>()
        {
            return typeof(TDocument).Name;
        }

        public void AuditFields<T>(T entity)
        {
            if (entity == null) return;

            var userIdStr = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);

            if (entity is IMAuditableEntity mEntity)
            {
                if (mEntity.CreatedDate == default)
                {
                    mEntity.CreatedDate = DateTime.Now;
                    mEntity.CreatedBy = userName;
                    mEntity.CreatedId = userIdStr;
                }
                mEntity.UpdatedDate = DateTime.Now;
                mEntity.UpdatedBy = userName;
                mEntity.UpdatedId = userIdStr;
            }
            else if (entity is AuditableEntity entityMongo)
            {
                Guid.TryParse(userIdStr, out var userIdGuid);
                AuditFields(entityMongo, userIdGuid, userName);
            }
        }

        public void AuditFields<T>(IEnumerable<T> entities)
        {
            if (entities == null) return;
            foreach (var entity in entities)
            {
                AuditFields(entity);
            }
        }

        private void AuditFields(AuditableEntity entity, Guid userId, string userName)
        {
            if (entity.Id == Guid.Empty)
            {
                entity.Id = Guid.NewGuid();
                entity.CreatedBy = userName;
                entity.CreatedId = userId;
                entity.CreatedDate = DateTime.Now;
            }
            entity.UpdatedBy = userName;
            entity.UpdatedId = userId;
            entity.UpdatedDate = DateTime.Now;

            foreach (var property in entity.GetType().GetProperties())
            {
                if (typeof(AuditableEntity).IsAssignableFrom(property.PropertyType))
                {
                    var subEntity = property.GetValue(entity) as AuditableEntity;
                    if (subEntity != null) AuditFields(subEntity, userId, userName);
                }
                else if (typeof(IEnumerable<AuditableEntity>).IsAssignableFrom(property.PropertyType))
                {
                    var subEntities = property.GetValue(entity) as IEnumerable<AuditableEntity>;
                    if (subEntities != null)
                    {
                        foreach (var subEntity in subEntities) AuditFields(subEntity, userId, userName);
                    }
                }
            }
        }
    }
}
