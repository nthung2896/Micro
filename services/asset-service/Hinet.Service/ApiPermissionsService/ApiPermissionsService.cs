using Hinet.Model.Entities;
using Hinet.Repository.ApiPermissionsRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.ApiPermissionsService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;
using Hinet.Repository.RoleRepository;
using Hinet.Repository.UserRoleRepository;
using Hinet.Service.ApiPermissionsService.Request;
using Microsoft.Extensions.Caching.Memory;
using Pipelines.Sockets.Unofficial;

namespace Hinet.Service.ApiPermissionsService
{
    public class ApiPermissionsService : Service<ApiPermissions>, IApiPermissionsService
    {
        private readonly IMemoryCache _cache;
        private readonly IUserRoleRepository _userRoleRepository;

        public ApiPermissionsService(
            IApiPermissionsRepository apiPermissionsRepository,
            IMemoryCache cache,
            IUserRoleRepository userRoleRepository
            ) : base(apiPermissionsRepository)
        {
            this._cache = cache;
            this._userRoleRepository = userRoleRepository;
        }



        public async Task<PagedList<ApiPermissionsDto>> GetData(ApiPermissionsSearch search)
        {
            var query = from q in GetQueryable()

                        select new ApiPermissionsDto()
                        {
                            UserId = q.UserId,
                            RoleId = q.RoleId,
                            Path = q.Path,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                        };
            if (search != null)
            {

            }
            query = query.OrderByDescending(x => x.CreatedDate);
            var result = await PagedList<ApiPermissionsDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<ApiPermissionsDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)

                              select new ApiPermissionsDto()
                              {
                                  UserId = q.UserId,
                                  RoleId = q.RoleId,
                                  Path = q.Path,
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

        public async Task<List<ApiPermissions>> GetByUserId(Guid? userId)
        {
            return await GetQueryable().Where(x => userId == x.UserId).ToListAsync();
        }


        public async Task<List<ApiPermissions>> GetByRoleId(Guid? roleId)
        {
            return await GetQueryable().Where(x => roleId == x.RoleId).ToListAsync();
        }

        public async Task<List<string?>> GetApiPermistionOfUser(Guid? userId)
        {
            var result = new List<string?>();
            var roleIds = await _userRoleRepository.GetQueryable().Where(x => x.UserId == userId).Select(x => x.RoleId).ToListAsync();

            var userApiPermissions = await GetQueryable().Where(x => x.UserId == userId).Select(x => x.Path).ToListAsync();
            var roleApiPermissions = await GetQueryable().Where(x => x.RoleId.HasValue && roleIds.Contains(x.RoleId.Value)).Select(x => x.Path).ToListAsync();

            result.AddRange(userApiPermissions);
            result.AddRange(roleApiPermissions);

            return result;
        }

        public async Task Save(ApiPermissionsSaveVM model)
        {
            model.Paths ??= new List<string>();

            if (model.FullPermission)
            {
                model.Paths = new List<string>();
                model.Controllers = new List<string>();
                model.Paths.Add("/api");
            }


            if (model.Controllers != null && model.Controllers.Count > 0)
            {
                foreach (var controller in model.Controllers)
                {
                    model.Paths = model.Paths.Where(x => !x.StartsWith($"{controller}/")).ToList();
                }
                model.Paths.AddRange(model.Controllers);
            }


            if (model.RoleId.HasValue)
            {
                var items = GetQueryable().Where(x => x.RoleId == model.RoleId).ToList();

                var deletes = items.Where(x => !model.Paths.Contains(x.Path)).ToList();
                if (deletes.Count > 0)
                {
                    await DeleteAsync(deletes);
                }
                var inserts = model.Paths.Where(x => !items.Any(y => y.Path == x)).ToList();
                if (inserts.Count > 0)
                {
                    var newItems = inserts.Select(x => new ApiPermissions()
                    {
                        RoleId = model.RoleId,
                        Path = x,
                        CreatedDate = DateTime.Now
                    }).ToList();
                    await CreateAsync(newItems);
                }
                if (inserts.Any() || deletes.Any())
                {
                    var userIds = await _userRoleRepository.GetQueryable().Where(x => x.RoleId == model.RoleId).Select(x => x.UserId).ToListAsync();
                    foreach (var userId in userIds)
                    {
                        _cache.Remove($"api_permissions_{userId}");

                    }

                }


            }
            if (model.UserId.HasValue)
            {
                var items = GetQueryable().Where(x => x.UserId == model.UserId).ToList();

                var deletes = items.Where(x => !model.Paths.Contains(x.Path)).ToList();
                if (deletes.Count > 0)
                {
                    await DeleteAsync(deletes);
                }
                var inserts = model.Paths.Where(x => !items.Any(y => y.Path == x)).ToList();
                if (inserts.Count > 0)
                {
                    var newItems = inserts.Select(x => new ApiPermissions()
                    {
                        UserId = model.UserId,
                        Path = x,
                        CreatedDate = DateTime.Now
                    }).ToList();
                    await CreateAsync(newItems);
                }
                if (inserts.Any() || deletes.Any())
                {
                    _cache.Remove($"api_permissions_{model.UserId}");
                }
            }
        }
    }
}
