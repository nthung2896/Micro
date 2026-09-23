using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.EmailService
{
    public interface ISenderService
    {
        Task SendMail(string subject, string body, string toEmail);
        Task SendMail(string subject, string body, string toEmail, List<string> attachmentPaths);
    }
}
