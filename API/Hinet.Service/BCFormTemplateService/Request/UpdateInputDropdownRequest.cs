using Hinet.Model.MongoEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.BCFormTemplateService.Request
{
    public class UpdateInputDropdownRequest
    {
        public string Id { get; set; } 
        public int IdThanhPhan { get; set; }
        public string InputKey { get; set; }
        public string DisplayName { get; set; }
        public string DataType { get; set; }
        public bool Required { get; set; }
        public string? PlaceHolder { get; set; }
        public bool IsCombobox { get; set; }
        public List<BCCategoryItem> LocalOptions { get; set; }
        public string? GlobalCategoryCode { get; set; }
    }
}
