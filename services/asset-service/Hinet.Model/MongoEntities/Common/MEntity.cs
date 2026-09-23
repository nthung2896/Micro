using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.IdGenerators;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.MongoEntities.Common
{
    public abstract class MBaseEntity
    {

    }

    public abstract class MEntity : MBaseEntity, IMEntity
    {
        [BsonId(IdGenerator = typeof(StringObjectIdGenerator))]
        [BsonRepresentation(BsonType.ObjectId)]
        public virtual string? Id { get; set; }
    }
}
