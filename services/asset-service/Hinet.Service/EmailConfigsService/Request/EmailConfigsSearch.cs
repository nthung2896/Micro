using Hinet.Service.Dto;

namespace Hinet.Service.EmailConfigsService.Request
{
    public class EmailConfigsSearch : SearchBase
    {
        public string? From { get; set; }
        public string? Host { get; set; }
        public string? UserName { get; set; }
        public bool? EnableSsl { get; set; }
        public bool? AllowSendMail { get; set; }
    }
}
