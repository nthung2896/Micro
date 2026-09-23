using Hinet.Model.MongoEntities.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Model.MongoEntities
{
    public class BCFormTemplate : MAuditableEntity<ObjectId>
    {
        public string? ItemId { get; set; }
        public string Name { get; set; }
        public List<string>? DoiTuongTypes { get; set; } // ["DOANH_NGHIEP", "HTX"]
        public string TemplateFilePath { get; set; }
        public string? HuongTrang { get; set; }
        public List<BCThanhPhanForm> ThanhPhanForms { get; set; }

        [BsonGuidRepresentation(GuidRepresentation.Standard)]
        public Guid? IdBaoCao { get; set; }
    }
    public class BCThanhPhanForm
    {
        public int IdThanhPhan { get; set; }
        public string Name { get; set; }
        public string HtmlContent { get; set; }
        public int OrderNumber { get; set; }
        public string ComponentType { get; set; } = "FLAT"; // "FLAT" hoặc "GRID"
        public string? GridDataSourceCategory { get; set; } // Ví dụ: "DM_TINH", "DM_NGANH_HANG"
        public List<BCInputConfig> Inputs { get; set; }
        public List<BCCategoryItem>? GridRows { get; set; } = new List<BCCategoryItem>();
    }

    public class BCInputConfig
    {
        public string InputKey { get; set; }
        public string DisplayName { get; set; }
        public string DataType { get; set; }
        public bool Required { get; set; }
        public string? PlaceHolder { get; set; }
        public bool IsCombobox { get; set; }
        public List<BCCategoryItem>? LocalOptions { get; set; } = new List<BCCategoryItem>();
        public string? GlobalCategoryCode { get; set; }

        public List<BCInputConfig>? TableColumns { get; set; } = new List<BCInputConfig>();
    }
}
