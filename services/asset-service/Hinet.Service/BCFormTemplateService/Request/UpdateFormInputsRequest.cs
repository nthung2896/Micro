using Hinet.Model.MongoEntities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.BCFormTemplateService.Request
{
    public class UpdateFormInputsRequest
    {
        public string? Id { get; set; }
        public Guid IdBaoCao { get; set; }
        public int IdThanhPhan { get; set; }

        public List<BCInputConfig> Inputs { get; set; }
    }
}
