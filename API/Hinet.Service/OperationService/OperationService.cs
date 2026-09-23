using Hinet.Model.Entities;
using Hinet.Repository.OperationRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.OperationService.Dto;
using Hinet.Service.Common;
using Microsoft.EntityFrameworkCore;
using Hinet.Repository.UserRoleRepository;
using Hinet.Repository.RoleRepository;
using Hinet.Repository.ModuleRepository;
using Hinet.Repository.RoleOperationRepository;
using Hinet.Service.OperationService.Request;

namespace Hinet.Service.OperationService
{
    public class OperationService : Service<Operation>, IOperationService
    {
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IModuleRepository _moduleRepository;
        private readonly IRoleOperationRepository _roleOperationRepository;

        public OperationService(
            IOperationRepository operationRepository,
            IUserRoleRepository userRoleRepository,
            IRoleRepository roleRepository,
            IModuleRepository moduleRepository,
            IRoleOperationRepository roleOperationRepository) : base(operationRepository)
        {
            _userRoleRepository = userRoleRepository;
            _roleRepository = roleRepository;
            _moduleRepository = moduleRepository;
            _roleOperationRepository = roleOperationRepository;
        }

        public async Task<PagedList<OperationDto>> GetData(OperationSearch search)
        {
            try
            {
                var query = from q in GetQueryable()
                            select new OperationDto
                            {
                                ModuleId = q.ModuleId,
                                CreatedId = q.CreatedId,
                                UpdatedId = q.UpdatedId,
                                Name = q.Name,
                                Url = q.Url,
                                Code = q.Code,
                                Css = q.Css,
                                Icon = q.Icon,
                                Order = q.Order,
                                IsShow = q.IsShow,
                                IsDeleted = q.IsDeleted,
                                Id = q.Id,
                                CreatedBy = q.CreatedBy,
                                UpdatedBy = q.UpdatedBy,
                                DeletedId = q.DeletedId,
                                CreatedDate = q.CreatedDate,
                                UpdatedDate = q.UpdatedDate,
                                DeletedDate = q.DeletedDate,
                                TrangThaiHienThi = q.IsShow ? "Hiển thị" : "Không hiển thị"
                            };

                if (search != null)
                {
                    if (search.ModuleId != null)
                        query = query.Where(x => x.ModuleId == search.ModuleId);

                    if (!string.IsNullOrEmpty(search.Name))
                        query = query.Where(x => x.Name.Contains(search.Name));

                    if (!string.IsNullOrEmpty(search.Code))
                        query = query.Where(x => x.Code.Contains(search.Code));

                    if (search.IsShow != null)
                        query = query.Where(x => x.IsShow == search.IsShow);
                }

                query = query.OrderBy(x => x.Order);
                return await PagedList<OperationDto>.CreateAsync(query, search);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve operation data: " + ex.Message);
            }
        }

        public async Task<OperationDto> GetDto(Guid id)
        {
            try
            {
                var item = await (from q in GetQueryable().Where(x => x.Id == id)
                                  select new OperationDto
                                  {
                                      ModuleId = q.ModuleId,
                                      CreatedId = q.CreatedId,
                                      UpdatedId = q.UpdatedId,
                                      Name = q.Name,
                                      Url = q.Url,
                                      Code = q.Code,
                                      Css = q.Css,
                                      Icon = q.Icon,
                                      Order = q.Order,
                                      IsShow = q.IsShow,
                                      IsDeleted = q.IsDeleted,
                                      Id = q.Id,
                                      CreatedBy = q.CreatedBy,
                                      UpdatedBy = q.UpdatedBy,
                                      DeletedId = q.DeletedId,
                                      CreatedDate = q.CreatedDate,
                                      UpdatedDate = q.UpdatedDate,
                                      DeletedDate = q.DeletedDate,
                                  }).FirstOrDefaultAsync();

                return item ?? throw new Exception("Operation not found for ID: " + id);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve operation DTO: " + ex.Message);
            }
        }

        public async Task<List<MenuDataDto>> GetListOperationOfUser(Guid userId)
        {
            try
            {
                var listRoleIdOfUser = await _userRoleRepository.GetQueryable()
                    .Where(x => x.UserId == userId)
                    .Join(_roleRepository.GetQueryable(),
                          userRole => userRole.RoleId,
                          role => role.Id,
                          (userRole, role) => role.Id)
                    .ToListAsync();

                var listOperationId = await _roleOperationRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => x.IsAccess == 1 && listRoleIdOfUser.Contains(x.RoleId))
                    .Select(x => x.OperationId)
                    .ToListAsync();

                return await (from moduleTbl in _moduleRepository.GetQueryable().AsNoTracking()
                              join operationTbl in GetQueryable().AsNoTracking()
                              on moduleTbl.Id equals operationTbl.ModuleId
                              where listOperationId.Contains(operationTbl.Id)
                              select new
                              {
                                  ModuleId = moduleTbl.Id,
                                  ModuleName = moduleTbl.Name,
                                  ModuleCode = moduleTbl.Code,
                                  ModuleIcon = moduleTbl.Icon,
                                  ModuleIsShow = moduleTbl.IsShow,
                                  OperationId = operationTbl.Id,
                                  OperationName = operationTbl.Name,
                                  OperationUrl = operationTbl.Url,
                                  OperationCode = operationTbl.Code
                              })
                              .GroupBy(x => new { x.ModuleId, x.ModuleName, x.ModuleCode, x.ModuleIcon, x.ModuleIsShow })
                              .Select(g => new MenuDataDto
                              {
                                  Id = g.Key.ModuleId,
                                  Name = g.Key.ModuleName,
                                  Code = g.Key.ModuleCode,
                                  Icon = g.Key.ModuleIcon,
                                  IsShow = g.Key.ModuleIsShow,
                                  ListMenu = g.Select(op => new MenuDataDto
                                  {
                                      Id = op.OperationId,
                                      Name = op.OperationName,
                                      Url = op.OperationUrl,
                                      Code = op.OperationCode,
                                      IsAccess = listOperationId.Contains(op.OperationId)
                                  }).ToList()
                              })
                              .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve operations of user: " + ex.Message);
            }
        }

        public async Task<List<ModuleMenuDTO>> GetListOperationOfRole(Guid roleId)
        {
            try
            {
                var listOperationId = _roleOperationRepository.GetQueryable()
                    .Where(x => x.IsAccess == 1 && x.RoleId == roleId)
                    .Select(x => x.OperationId)
                    .ToList();

                return await (from moduleTbl in _moduleRepository.GetQueryable()
                              join operationTbl in GetQueryable()
                              on moduleTbl.Id equals operationTbl.ModuleId
                              select new
                              {
                                  Id = moduleTbl.Id,
                                  Name = moduleTbl.Name,
                                  Code = moduleTbl.Code,
                                  Icon = moduleTbl.Icon,
                                  IsShow = moduleTbl.IsShow,
                                  NameOpear = operationTbl.Name,
                                  Url = operationTbl.Url,
                                  codeOpe = operationTbl.Code,
                                  Idoperation = operationTbl.Id
                              })
                              .GroupBy(x => new { x.Name, x.Code, x.Icon, x.Id, x.IsShow })
                              .Select(x => new ModuleMenuDTO
                              {
                                  Name = x.Key.Name,
                                  Code = x.Key.Code,
                                  Icon = x.Key.Icon,
                                  Id = x.Key.Id,
                                  IsShow = x.Key.IsShow,
                                  ListOperation = x.Select(y => new OperationDto
                                  {
                                      Name = y.NameOpear,
                                      Url = y.Url,
                                      Code = y.codeOpe,
                                      Id = y.Idoperation,
                                      IsAccess = listOperationId.Any(z => z == y.Idoperation)
                                  }).ToList()
                              })
                              .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve operations of role: " + ex.Message);
            }
        }

        public async Task<List<MenuDataDto>> GetListMenu(Guid userId, List<string> RoleCodes)
        {
            try
            {
                var listRoleIdOfUser = await _roleRepository.GetQueryable()
                    .Where(x => RoleCodes.Contains(x.Code))
                    .Select(x => x.Id)
                    .ToListAsync() ?? new List<Guid>();

                var listOperationId = await _roleOperationRepository.GetQueryable()
                    .AsNoTracking()
                    .Where(x => listRoleIdOfUser.Contains(x.RoleId))
                    .Select(x => x.OperationId)
                    .ToListAsync();




                return await (from moduleTbl in _moduleRepository.GetQueryable().AsNoTracking().OrderBy(x => x.Order)
                              join operationTbl in GetQueryable().AsNoTracking()
                              on moduleTbl.Id equals operationTbl.ModuleId
                              where listOperationId.Contains(operationTbl.Id)
                              select new
                              {
                                  ModuleId = moduleTbl.Id,
                                  ModuleName = moduleTbl.Name,
                                  ModuleCode = moduleTbl.Code,
                                  ModuleIcon = moduleTbl.Icon,
                                  ModuleIsShow = moduleTbl.IsShow,
                                  OperationId = operationTbl.Id,
                                  OperationName = operationTbl.Name,
                                  OperationUrl = operationTbl.Url,
                                  OperationCode = operationTbl.Code,
                                  Link = moduleTbl.Link,
                                  ModuleOrder = moduleTbl.Order,
                                  OperationOrder = operationTbl.Order,
                                  OperationIsShow = operationTbl.IsShow,
                                  ClassCss = moduleTbl.ClassCss,
                              })
                              .GroupBy(x => new { x.ModuleId, x.ModuleName, x.ModuleCode, x.ModuleIcon, x.ModuleIsShow, x.Link, x.ModuleOrder, x.ClassCss })
                              .OrderBy(g => g.Key.ModuleOrder)
                              .Select(g => new MenuDataDto
                              {
                                  Id = g.Key.ModuleId,
                                  Name = g.Key.ModuleName,
                                  Code = g.Key.ModuleCode,
                                  Icon = g.Key.ModuleIcon,
                                  ClassCss = g.Key.ClassCss,
                                  IsShow = g.Key.ModuleIsShow,
                                  Url = g.Key.Link,
                                  ListMenu = g.OrderBy(op => op.OperationOrder)
                                              .Select(op => new MenuDataDto
                                              {
                                                  Id = op.OperationId,
                                                  Name = op.OperationName,
                                                  Url = op.OperationUrl,
                                                  Code = op.OperationCode,
                                                  IsShow = op.OperationIsShow,
                                                  IsAccess = listOperationId.Contains(op.OperationId)
                                              })
                                              .ToList(),
                                  IsAccess = g.Any(op => listOperationId.Contains(op.OperationId))
                              })
                              .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve menu list: " + ex.Message);
            }
        }
    }
}