using Hinet.Model.Entities;
using Hinet.Repository.EmailConfigsRepository;
using Hinet.Repository.EmailTemplatesRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.EmailTemplatesService.Dto;
using Hinet.Service.EmailTemplatesService.Request;
using MailKit.Net.Smtp;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace Hinet.Service.EmailTemplatesService
{
    public class EmailTemplatesService : Service<EmailTemplates>, IEmailTemplatesService
    {
        private readonly IEmailConfigsRepository _emailConfigsRepository;

        public EmailTemplatesService(
            IEmailTemplatesRepository repository,
            IEmailConfigsRepository emailConfigsRepository) : base(repository)
        {
            _emailConfigsRepository = emailConfigsRepository;
        }

        public async Task<PagedList<EmailTemplatesDto>> GetData(EmailTemplatesSearch search)
        {
            search ??= new EmailTemplatesSearch();

            var query = GetQueryable().Select(q => new EmailTemplatesDto
            {
                Id = q.Id,
                Code = q.Code,
                Subject = q.Subject,
                Body = q.Body,
                BodyType = q.BodyType,
                Variables = q.Variables,
                Description = q.Description,
                IsActive = q.IsActive,
                CreatedDate = q.CreatedDate,
                UpdatedDate = q.UpdatedDate,
                CreatedBy = q.CreatedBy,
                UpdatedBy = q.UpdatedBy,
            });

            if (!string.IsNullOrWhiteSpace(search.Code))
                query = query.Where(x => x.Code != null && x.Code.Contains(search.Code));
            if (!string.IsNullOrWhiteSpace(search.Subject))
                query = query.Where(x => x.Subject != null && x.Subject.Contains(search.Subject));
            if (!string.IsNullOrWhiteSpace(search.BodyType))
                query = query.Where(x => x.BodyType == search.BodyType);
            if (search.IsActive.HasValue)
                query = query.Where(x => x.IsActive == search.IsActive.Value);

            query = query.OrderByDescending(x => x.CreatedDate);
            return await PagedList<EmailTemplatesDto>.CreateAsync(query, search);
        }

        public async Task<EmailTemplatesDto?> GetDto(Guid id)
        {
            return await GetQueryable().Where(x => x.Id == id).Select(q => new EmailTemplatesDto
            {
                Id = q.Id,
                Code = q.Code,
                Subject = q.Subject,
                Body = q.Body,
                BodyType = q.BodyType,
                Variables = q.Variables,
                Description = q.Description,
                IsActive = q.IsActive,
                CreatedDate = q.CreatedDate,
                UpdatedDate = q.UpdatedDate,
                CreatedBy = q.CreatedBy,
                UpdatedBy = q.UpdatedBy,
            }).FirstOrDefaultAsync();
        }

        public async Task<bool> SendDynamicEmailAsync(SendDynamicEmailRequest request)
        {
            try
            {
                // Lấy template
                var template = await GetQueryable()
                    .Where(x => x.Id == request.IdEmailTemplate)
                    .FirstOrDefaultAsync();

                if (template == null || !template.IsActive)
                    return false;

                // Lấy cấu hình email khả dụng
                var config = await _emailConfigsRepository.GetQueryable()
                    .Where(x => x.AllowSendMail == true)
                    .OrderBy(x => x.SentToday ?? 0)
                    .FirstOrDefaultAsync();

                if (config == null)
                    return false;

                // Render template với dữ liệu
                var model = ConvertData(request.Data);
                var subject = RenderTemplate(template.Subject ?? "", model);
                var body = RenderTemplate(template.Body ?? "", model);

                // Tạo email
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(config.Alias ?? config.From ?? "", config.From ?? ""));
                email.To.Add(new MailboxAddress("", request.ToEmail));
                email.Subject = subject;
                email.Body = new TextPart(template.BodyType == "text" ? "plain" : "html") { Text = body };

                // Gửi qua SMTP
                using var smtp = new SmtpClient();
                var useSsl = config.EnableSsl == true;
                var port = int.TryParse(config.Port, out var p) ? p : 587;

                if (port == 587 && useSsl)
                    await smtp.ConnectAsync(config.Host, port, MailKit.Security.SecureSocketOptions.StartTls);
                else if (port == 465 && useSsl)
                    await smtp.ConnectAsync(config.Host, port, MailKit.Security.SecureSocketOptions.SslOnConnect);
                else if (useSsl)
                    await smtp.ConnectAsync(config.Host, port, MailKit.Security.SecureSocketOptions.Auto);
                else
                    await smtp.ConnectAsync(config.Host, port, MailKit.Security.SecureSocketOptions.None);

                if (!string.IsNullOrWhiteSpace(config.UserName))
                    await smtp.AuthenticateAsync(config.UserName, config.Password);

                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Render template đơn giản: thay {{variable}} bằng giá trị từ data
        /// </summary>
        private static string RenderTemplate(string templateText, Dictionary<string, string> model)
        {
            if (string.IsNullOrEmpty(templateText)) return templateText;

            return Regex.Replace(templateText, @"\{\{(\w+)\}\}", match =>
            {
                var key = match.Groups[1].Value;
                return model.TryGetValue(key, out var value) ? value : match.Value;
            });
        }

        public async Task<bool> SendByCodeAsync(SendEmailByCodeRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return false;

            var template = await GetQueryable()
                .Where(x => x.Code == request.Code.Trim().ToUpper() && x.IsActive)
                .FirstOrDefaultAsync();

            if (template == null)
                return false;

            return await SendDynamicEmailAsync(new SendDynamicEmailRequest
            {
                IdEmailTemplate = template.Id,
                ToEmail = request.ToEmail,
                Data = request.Data,
            });
        }

        private static Dictionary<string, string> ConvertData(Dictionary<string, object>? input)
        {
            var result = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            if (input == null) return result;

            foreach (var kv in input)
            {
                if (kv.Value is JsonElement json)
                    result[kv.Key] = json.ToString();
                else
                    result[kv.Key] = kv.Value?.ToString() ?? "";
            }
            return result;
        }
    }
}
