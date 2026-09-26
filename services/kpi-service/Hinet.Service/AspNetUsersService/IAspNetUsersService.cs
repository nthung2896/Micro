using Hinet.Model.Entities;
using Hinet.Service.AppUserService.Dto;
using Hinet.Service.AspNetUsersService.Dto;
using Hinet.Service.AspNetUsersService.Request;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Dto;

namespace Hinet.Service.AspNetUsersService
{
    public interface IAspNetUsersService : IService<AppUser>
    {
        Task<PagedList<AppUserDto>> GetData(AspNetUsersSearch search, AppUserDto userDto = null);

        Task<AspNetUsersDto> GetDto(Guid id);

        Task<List<AppUser>> GetUserByCanBoIds(List<Guid> canboIds);

        Task<AppUser> GetUserByCanBoId(Guid? canboId);
        Task<AppUser> GetUserByUserName(string userName);

        Task<List<DropdownOption>> GetDropdownOptionsByRole(string RoleCode);
        Task<List<DropdownOption>> GetDropdownOptionsDonViId(Guid DonViId);
        Task<PagedList<AppUserDto>> GetUserByRole(AspNetUsersSearch search);
        Task<(bool IsSuccess, AppUser? Data, List<string> Errors)> CreateAccount(AspNetUsersRequest model);
        Task<(bool IsSuccess, string Message, List<DropdownOption>? Data)> GetCanBoByDonViId(Guid donViId);
        Task<int> SetDefaultRoleCaNhanForUsersWithoutRole();
        Task<(int Total, int Success, List<string> Errors)> SyncAllUsersToIdentity();
    }
}