using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.OperationService.Dto
{
    public class MenuDataDto
    {
        public Guid Id { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public int Order { get; set; }
        public bool IsShow { get; set; }
        public string? Icon { get; set; }
        public string? ClassCss { get; set; }
        public string? StyleCss { get; set; }
        public bool? AllowFilterScope { get; set; }
        public bool? IsMobile { get; set; }
        public bool? IsAccess { get; set; } //User có thể thấy module hay không

        public Guid ModuleId { get; set; }
        public string? Url { get; set; }
        public List<MenuDataDto>? ListMenu { get; set; }


    }
}
