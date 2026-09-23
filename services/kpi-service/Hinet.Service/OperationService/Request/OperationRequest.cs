
using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.OperationService.Request
{
    public class OperationRequest
    {
        public Guid? Id { get; set; }
        [Required]
        public Guid ModuleId { get; set; }
        public string? CreatedId { get; set; }
        public string? UpdatedId { get; set; }
        [Required]
        public string? Name { get; set; }

        public string? Url { get; set; }
        [Required]
        public string? Code { get; set; }

        public string? Css { get; set; }

        public string? Icon { get; set; }

        public int Order { get; set; }

        public bool IsShow { get; set; }
    }
}