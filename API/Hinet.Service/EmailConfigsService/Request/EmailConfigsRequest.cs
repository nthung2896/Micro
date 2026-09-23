namespace Hinet.Service.EmailConfigsService.Request
{
    public class EmailConfigsRequest
    {
        public Guid? Id { get; set; }
        public string? From { get; set; }
        public string? Host { get; set; }
        public string? Alias { get; set; }
        public string? Port { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public bool? EnableSsl { get; set; }
        public bool? AllowSendMail { get; set; }
        public int? DailyLimit { get; set; }
    }
}
