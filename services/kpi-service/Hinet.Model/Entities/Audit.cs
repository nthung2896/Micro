using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.Entities
{
    [Table("Audit")]
    public class Audit : AuditableEntity
    {
        public string SessionID { get; set; }
        [BsonRepresentation(BsonType.String)]
        public Guid AuditID { get; set; }
        public string IPAddress { get; set; }
        public string UserName { get; set; }
        [BsonRepresentation(BsonType.String)]
        public Guid UserId { get; set; }
        public string URLAccessed { get; set; }
        public DateTime TimeAccessed { get; set; }
        public string Note { get; set; }
        public int Type { get; set; }
        // A new Data property that is going to store JSON
        // string objects that will later be able to be
        // deserialized into objects if necessary to view
        // details about a Request
        public string Data { get; set; }
    }
}
