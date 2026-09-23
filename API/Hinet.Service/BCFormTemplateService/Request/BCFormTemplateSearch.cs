using Hinet.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.BCFormTemplateService.Request
{
    public class BCFormTemplateSearch : SearchBase
    {
        public Guid? IdBaoCao { get; set; } // Map lỏng sang Postgres
        public string? Name { get; set; }
    }
}
