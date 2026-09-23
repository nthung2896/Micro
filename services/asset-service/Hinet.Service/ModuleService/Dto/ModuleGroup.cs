using Hinet.Service.OperationService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.ModuleService.Dto
{
    public class ModuleGroup
    {
        public Guid ModuleId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public string ModuleCode { get; set; } = string.Empty;
        public List<OperationDto>? Operations { get; set; }
        public List<string>? SelectedCodes { get; set; }
    }
}
