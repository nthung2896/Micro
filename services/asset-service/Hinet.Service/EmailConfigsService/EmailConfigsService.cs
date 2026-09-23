using Hinet.Model.Entities;
using Hinet.Repository.EmailConfigsRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.EmailConfigsService.Dto;
using Hinet.Service.EmailConfigsService.Request;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Service.EmailConfigsService
{
    public class EmailConfigsService : Service<EmailConfigs>, IEmailConfigsService
    {
        public EmailConfigsService(IEmailConfigsRepository repository) : base(repository)
        {
        }

        public async Task<PagedList<EmailConfigsDto>> GetData(EmailConfigsSearch search)
        {
            search ??= new EmailConfigsSearch();

            var query = GetQueryable().Select(q => new EmailConfigsDto
            {
                Id = q.Id,
                From = q.From,
                Host = q.Host,
                Alias = q.Alias,
                Port = q.Port,
                UserName = q.UserName,
                Password = null, // Không trả password ra FE
                EnableSsl = q.EnableSsl,
                AllowSendMail = q.AllowSendMail,
                DailyLimit = q.DailyLimit,
                SentToday = q.SentToday,
                QuotaResetDate = q.QuotaResetDate,
                LastUsedAt = q.LastUsedAt,
                ConsecutiveFailures = q.ConsecutiveFailures,
                LastFailedAt = q.LastFailedAt,
                LastFailReason = q.LastFailReason,
                CreatedDate = q.CreatedDate,
                UpdatedDate = q.UpdatedDate,
                CreatedBy = q.CreatedBy,
                UpdatedBy = q.UpdatedBy,
            });

            if (!string.IsNullOrWhiteSpace(search.From))
                query = query.Where(x => x.From != null && x.From.Contains(search.From));
            if (!string.IsNullOrWhiteSpace(search.Host))
                query = query.Where(x => x.Host != null && x.Host.Contains(search.Host));
            if (!string.IsNullOrWhiteSpace(search.UserName))
                query = query.Where(x => x.UserName != null && x.UserName.Contains(search.UserName));
            if (search.EnableSsl.HasValue)
                query = query.Where(x => x.EnableSsl == search.EnableSsl);
            if (search.AllowSendMail.HasValue)
                query = query.Where(x => x.AllowSendMail == search.AllowSendMail);

            query = query.OrderByDescending(x => x.CreatedDate);
            return await PagedList<EmailConfigsDto>.CreateAsync(query, search);
        }

        public async Task<EmailConfigsDto?> GetDto(Guid id)
        {
            return await GetQueryable().Where(x => x.Id == id).Select(q => new EmailConfigsDto
            {
                Id = q.Id,
                From = q.From,
                Host = q.Host,
                Alias = q.Alias,
                Port = q.Port,
                UserName = q.UserName,
                Password = null,
                EnableSsl = q.EnableSsl,
                AllowSendMail = q.AllowSendMail,
                DailyLimit = q.DailyLimit,
                SentToday = q.SentToday,
                QuotaResetDate = q.QuotaResetDate,
                LastUsedAt = q.LastUsedAt,
                ConsecutiveFailures = q.ConsecutiveFailures,
                LastFailedAt = q.LastFailedAt,
                LastFailReason = q.LastFailReason,
                CreatedDate = q.CreatedDate,
                UpdatedDate = q.UpdatedDate,
                CreatedBy = q.CreatedBy,
                UpdatedBy = q.UpdatedBy,
            }).FirstOrDefaultAsync();
        }
    }
}
