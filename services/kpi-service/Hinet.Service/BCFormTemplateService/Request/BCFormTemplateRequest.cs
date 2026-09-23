using Hinet.Model.MongoEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.BCFormTemplateService.Request
{
    public class BCFormTemplateRequest
    {
        public string? Id { get; set; }

        public string? ItemId { get; set; }
        public string Name { get; set; }
        public List<string> DoiTuongTypes { get; set; } = new List<string>();
        public string TemplateFilePath { get; set; }
        public string? HuongTrang { get; set; }

        public Guid? IdBaoCao { get; set; }
    }
}
