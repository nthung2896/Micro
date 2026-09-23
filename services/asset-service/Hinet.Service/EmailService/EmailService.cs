using Hinet.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Hinet.Service.EmailService
{
    public class EmailService : ISenderService
    {
        public async Task SendMail(string subject, string body, string toEmail)
        {
            var smtpClient = new SmtpClient
            {
                Host = AppSettings.Mail.Host!,
                Port = AppSettings.Mail.Port,
                Credentials = new System.Net.NetworkCredential(
                    AppSettings.Mail.UserName, AppSettings.Mail.Password),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(AppSettings.Mail.From!),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);
            await smtpClient.SendMailAsync(mailMessage);
        }
        public async Task SendMail(string subject, string body, string toEmail, List<string> attachmentPaths)
        {
            var smtpClient = new SmtpClient
            {
                Host = AppSettings.Mail.Host!,
                Port = AppSettings.Mail.Port,
                Credentials = new System.Net.NetworkCredential(
                    AppSettings.Mail.UserName, AppSettings.Mail.Password),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(AppSettings.Mail.From!),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            if (attachmentPaths != null && attachmentPaths.Any())
            {
                foreach (var path in attachmentPaths)
                {
                    if (System.IO.File.Exists(path))
                    {
                        mailMessage.Attachments.Add(new Attachment(path));
                    }
                }
            }

            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
