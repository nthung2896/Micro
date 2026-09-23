using Hinet.Model.Entities;

namespace Hinet.Service.EmailConfigsService.Dto
{
    public class EmailConfigsDto : EmailConfigs
    {
        public string? PasswordMasked =>
            string.IsNullOrWhiteSpace(Password) ? "" : new string('*', 8);
    }
}
