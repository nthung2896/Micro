using System.ComponentModel.DataAnnotations;

namespace Hinet.Service.EmailTemplatesService.Request
{
    public class EmailTemplatesRequest
    {
        public Guid? Id { get; set; }

        [Required]
        public string Code { get; set; } = "";

        [Required]
        public string Subject { get; set; } = "";

        [Required]
        public string Body { get; set; } = "";

        public string? BodyType { get; set; } = "html";
        public string? Variables { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
