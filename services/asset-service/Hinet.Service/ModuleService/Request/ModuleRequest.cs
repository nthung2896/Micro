
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.ModuleService.Request
{
    public class ModuleRequest
    {
        public Guid? Id { get; set; }
        public string? CreatedId { get; set; }
        public string? UpdatedId { get; set; }

        public int? Order { get; set; }

        public bool IsShow { get; set; }
        public bool? AllowFilterScope { get; set; }
        public bool? IsMobile { get; set; }
        [Required]
        public string? Code { get; set; }
        [Required]
        public string? Name { get; set; }

        public string? Icon { get; set; }

        public string? ClassCss { get; set; }

        public string? StyleCss { get; set; }

        public string? Link { get; set; }

        public Guid? FileId { get; set; }
    }
}