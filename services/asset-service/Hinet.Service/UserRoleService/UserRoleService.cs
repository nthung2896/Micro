using Hinet.Model.Entities;
using Hinet.Repository.UserRoleRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.UserRoleService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;
using Hinet.Service.UserRoleService.Request;
using Hinet.Repository.DepartmentRepository;
using Hinet.Service.DepartmentService.Request;
using Hinet.Service.DepartmentService;
using Hinet.Repository.RoleRepository;
using Hinet.Service.RoleService.Request;

namespace Hinet.Service.UserRoleService
{
    public class UserRoleService : Service<UserRole>, IUserRoleService
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IDepartmentService _departmentService;
        private readonly IRoleRepository _roleRepository;

        public UserRoleService(
            IUserRoleRepository userRoleRepository,
            IDepartmentRepository departmentRepository,
            IDepartmentService departmentService,
            IRoleRepository roleRepository) : base(userRoleRepository)
        {
            _departmentRepository = departmentRepository;
            _departmentService = departmentService;
            _roleRepository = roleRepository;
        }

        public async Task<PagedList<UserRoleDto>> GetData(UserRoleSearch search)
        {
            try
            {
                var query = from q in GetQueryable()
                            select new UserRoleDto
                            {
                                UserId = q.UserId,
                                RoleId = q.RoleId,
                                CreatedId = q.CreatedId,
                                UpdatedId = q.UpdatedId,
                                DeletedId = q.DeletedId,
                                CreatedDate = q.CreatedDate,
                                UpdatedDate = q.UpdatedDate,
                                DeletedDate = q.DeletedDate,
                                IsDeleted = q.IsDeleted,
                                CreatedBy = q.CreatedBy,
                                UpdatedBy = q.UpdatedBy,
                                Id = q.Id,
                            };

                query = query.OrderByDescending(x => x.CreatedDate);
                return await PagedList<UserRoleDto>.CreateAsync(query, search);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve user role data: " + ex.Message);
            }
        }

        public async Task<UserRoleDto> GetDto(Guid id)
        {
            try
            {
                var item = await (from q in GetQueryable().Where(x => x.Id == id)
                                  select new UserRoleDto
                                  {
                                      UserId = q.UserId,
                                      RoleId = q.RoleId,
                                      CreatedId = q.CreatedId,
                                      UpdatedId = q.UpdatedId,
                                      DeletedId = q.DeletedId,
                                      CreatedDate = q.CreatedDate,
                                      UpdatedDate = q.UpdatedDate,
                                      DeletedDate = q.DeletedDate,
                                      IsDeleted = q.IsDeleted,
                                      CreatedBy = q.CreatedBy,
                                      UpdatedBy = q.UpdatedBy,
                                      Id = q.Id,
                                  }).FirstOrDefaultAsync() ?? throw new Exception("User role not found");

                return item;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve user role DTO: " + ex.Message);
            }
        }

        public UserRole GetByUserAndRole(Guid userId, Guid roleId)
        {
            return GetQueryable().FirstOrDefault(x => x.UserId == userId && x.RoleId == roleId);
        }

        public List<UserRole> GetByUser(Guid userId)
        {
            return GetQueryable().Where(x => x.UserId == userId).ToList();
        }

        public async Task<UserRoleVM> GetUserRoleVM(Guid userId)
        {
            var listUserRole = GetQueryable().Where(x => x.UserId == userId && x.IsDeleted != true).ToList();

            var listRole = await _roleRepository.GetQueryable().Where(x => x.IsActive == true)
                                .Select(x => new RoleVM
                                {
                                    Id = x.Id,
                                    Name = x.Name,
                                    Code = x.Code,
                                }).ToListAsync();

            var departments = await _departmentRepository.GetQueryable().ToListAsync();
            var listDepartment = _departmentService.BuildDepartmentHierarchy();

            foreach (var dept in listDepartment)
            {
                foreach (var role in listRole)
                {
                    if (listUserRole.Any(x => x.DepartmentId == dept.Id && x.RoleId == role.Id))
                    {
                        role.IsChecked = true;
                    }
                }
                dept.Roles = listRole;
            }

            return new UserRoleVM
            {
                UserId = userId,
                Departments = listDepartment
            };
        }

        /// <summary>
        /// Lấy ra rolecodes của account
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        public List<string> GetListRoleCodeByUserId(Guid userId)
        {
            var query = GetQueryable().Where(x => x.UserId == userId)
                .Join(_roleRepository.GetQueryable(),
                ur => ur.RoleId,
                rl => rl.Id,
                (ur, rl) => new { rl.Code })
                .Select(x => x.Code)
                .Distinct()
                .ToList();

            return query;
        }

    }
}