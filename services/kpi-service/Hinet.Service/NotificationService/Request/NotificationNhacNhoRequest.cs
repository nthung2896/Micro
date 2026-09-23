using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.NotificationService.Request
{
    public class NotificationNhacNhoRequest
    {
        public string? Message { get; set; }
        public string? Link { get; set; }
        public Guid? FromUser { get; set; }
        public string FromUserName { get; set; }
        public Guid? ItemId { get; set; }
    }
}
