using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.MongoEntities.Common
{
    public abstract class MAuditableEntity<T> : MEntity, IMAuditableEntity
    {
        [ScaffoldColumn(false)]
        [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
        public DateTime CreatedDate { get; set; }

         
        [MaxLength(256)]
        [ScaffoldColumn(false)]
        public string? CreatedBy { get; set; }
        public string? CreatedId { get; set; }

        [ScaffoldColumn(false)]
        [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
        public DateTime UpdatedDate { get; set; }

        [MaxLength(256)]
        [ScaffoldColumn(false)]
        public string? UpdatedBy { get; set; }
        [ScaffoldColumn(false)]
        public string? UpdatedId { get; set; }

        public bool? IsDelete { get; set; }
        [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
        public DateTime? DeleteTime { get; set; }
        public string? DeletedId { get; set; }
    }
}
