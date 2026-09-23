using Hinet.Service.Dto;

namespace Hinet.Service.EmailTemplatesService.Request
{
    public class EmailTemplatesSearch : SearchBase
    {
        public string? Code { get; set; }
        public string? Subject { get; set; }
        public string? BodyType { get; set; }
        public bool? IsActive { get; set; }
    }
}
