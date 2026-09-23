using Hinet.Model.Entities;
using Hinet.Repository.AppConfigurationRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.AppConfigurationService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Service.AppConfigurationService
{
    public class AppConfigurationService : Service<AppConfiguration>, IAppConfigurationService
    {

        public AppConfigurationService(
            IAppConfigurationRepository appConfigurationRepository
            ) : base(appConfigurationRepository)
        {
            
        }

        public async Task<PagedList<AppConfigurationDto>> GetData(AppConfigurationSearch search)
        {
            var query = from q in GetQueryable()
                        
                        select new AppConfigurationDto()
                        {
                            TenApp = q.TenApp,
                            TenDoanhNghiep = q.TenDoanhNghiep,
                            DiaChi = q.DiaChi,
                            SoDienThoai = q.SoDienThoai,
                            Email = q.Email,
                            LogoLink = q.LogoLink,
                            LoginBackgroundLink = q.LoginBackgroundLink,
                            LoginModalImage = q.LoginModalImage,
                            PrimaryColor = q.PrimaryColor,
                            isActive = q.isActive,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                        };
            if(search != null )
            {
                if(!string.IsNullOrEmpty(search.TenApp))
                {
                    query = query.Where(x => EF.Functions.Like(x.TenApp, $"%{search.TenApp}%"));
                }
                if(!string.IsNullOrEmpty(search.TenDoanhNghiep))
                {
                    query = query.Where(x => EF.Functions.Like(x.TenDoanhNghiep, $"%{search.TenDoanhNghiep}%"));
                }
                if(!string.IsNullOrEmpty(search.DiaChi))
                {
                    query = query.Where(x => EF.Functions.Like(x.DiaChi, $"%{search.DiaChi}%"));
                }
                if(!string.IsNullOrEmpty(search.SoDienThoai))
                {
                    query = query.Where(x => EF.Functions.Like(x.SoDienThoai, $"%{search.SoDienThoai}%"));
                }
                if(!string.IsNullOrEmpty(search.Email))
                {
                    query = query.Where(x => EF.Functions.Like(x.Email, $"%{search.Email}%"));
                }
                if(!string.IsNullOrEmpty(search.LogoLink))
                {
                    query = query.Where(x => EF.Functions.Like(x.LogoLink, $"%{search.LogoLink}%"));
                }
                if(!string.IsNullOrEmpty(search.LoginBackgroundLink))
                {
                    query = query.Where(x => EF.Functions.Like(x.LoginBackgroundLink, $"%{search.LoginBackgroundLink}%"));
                }
                if(!string.IsNullOrEmpty(search.LoginModalImage))
                {
                    query = query.Where(x => EF.Functions.Like(x.LoginModalImage, $"%{search.LoginModalImage}%"));
                }
                if(!string.IsNullOrEmpty(search.PrimaryColor))
                {
                    query = query.Where(x => EF.Functions.Like(x.PrimaryColor, $"%{search.PrimaryColor}%"));
                }
                if(search.isActive.HasValue)
                {
                    query = query.Where(x => x.isActive == search.isActive.Value);
                }
            }
            query = query.OrderByDescending(x => x.isActive == true).ThenByDescending(x => x.CreatedDate);
            var result = await PagedList<AppConfigurationDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<AppConfigurationDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        
                        select new AppConfigurationDto()
                        {
                            TenApp = q.TenApp,
                            TenDoanhNghiep = q.TenDoanhNghiep,
                            DiaChi = q.DiaChi,
                            SoDienThoai = q.SoDienThoai,
                            Email = q.Email,
                            LogoLink = q.LogoLink,
                            LoginBackgroundLink = q.LoginBackgroundLink,
                            LoginModalImage = q.LoginModalImage,
                            PrimaryColor = q.PrimaryColor,
                            isActive = q.isActive,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                        }).FirstOrDefaultAsync();
            
            return item;
        }

        public async Task SetActiveConfigAsync(Guid activeId)
        {
            var otherActiveItems = await GetQueryable()
                .Where(x => !x.IsDeleted && x.Id != activeId && x.isActive == true)
                .ToListAsync();

            if (otherActiveItems.Count == 0) return;

            // Cập nhật tất cả trong bộ nhớ, sau đó SaveChanges 1 lần duy nhất
            foreach (var item in otherActiveItems)
            {
                item.isActive = false;
            }
            await UpdateAsync(otherActiveItems);
        }

    }
}
    