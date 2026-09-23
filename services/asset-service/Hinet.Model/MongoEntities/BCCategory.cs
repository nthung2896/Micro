using Hinet.Model.MongoEntities.Common;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.MongoEntities
{
    public class BCCategory : MAuditableEntity<ObjectId>
    {
        public string CategoryCode { get; set; }
        public string Name { get; set; }
        public List<BCCategoryItem> Items { get; set; }
    }

    public class BCCategoryItem
    {
        public string Text { get; set; }
        public string Value { get; set; }
    }
}
