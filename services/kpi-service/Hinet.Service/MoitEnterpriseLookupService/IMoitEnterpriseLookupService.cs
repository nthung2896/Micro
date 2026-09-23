using Hinet.Service.MoitEnterpriseLookupService.Dto;

namespace Hinet.Service.MoitEnterpriseLookupService
{
    public interface IMoitEnterpriseLookupService
    {
        Task<string?> LoginAndGetTokenAsync();
        Task<MoitEnterpriseDetail?> LookupEnterpriseAsync(string msdn);
    }
}
