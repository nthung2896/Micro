using Hinet.Model.Entities;
using Hinet.Repository.ModuleRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.ModuleService.Dto;
using Hinet.Service.Common;
using Microsoft.EntityFrameworkCore;
using Hinet.Repository.OperationRepository;
using ZstdSharp.Unsafe;
using Hinet.Repository.RoleRepository;
using Hinet.Repository.RoleOperationRepository;
using Hinet.Service.OperationService.Dto;
using Hinet.Service.RoleOperationService.Dto;
using Hinet.Service.Dto;
using Hinet.Service.ModuleService.Request;

namespace Hinet.Service.ModuleService
{
    public class ModuleService : Service<Module>, IModuleService
    {
        private readonly IOperationRepository _operationRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IRoleOperationRepository _roleOperationRepository;

        public ModuleService(
            IModuleRepository moduleRepository,
            IOperationRepository operationRepository,
            IRoleRepository roleRepository,
            IRoleOperationRepository roleOperationRepository) : base(moduleRepository)
        {
            _operationRepository = operationRepository;
            _roleRepository = roleRepository;
            _roleOperationRepository = roleOperationRepository;
        }

        public async Task<PagedList<ModuleDto>> GetData(ModuleSearch search)
        {
            try
            {
                var query = from q in GetQueryable()
                            select new ModuleDto
                            {
                                CreatedId = q.CreatedId,
                                UpdatedId = q.UpdatedId,
                                Order = q.Order,
                                IsShow = q.IsShow,
                                AllowFilterScope = q.AllowFilterScope,
                                IsMobile = q.IsMobile,
                                Code = q.Code,
                                Name = q.Name,
                                Icon = q.Icon,
                                ClassCss = q.ClassCss,
                                StyleCss = q.StyleCss,
                                Link = q.Link,
                                CreatedBy = q.CreatedBy,
                                UpdatedBy = q.UpdatedBy,
                                IsDeleted = q.IsDeleted,
                                DeletedId = q.DeletedId,
                                CreatedDate = q.CreatedDate,
                                UpdatedDate = q.UpdatedDate,
                                DeletedDate = q.DeletedDate,
                                Id = q.Id,
                                TrangThaiHienThi = q.IsShow ? "Hiển thị?" : "Không hiển thị?"
                            };

                if (search != null)
                {
                    if (!string.IsNullOrEmpty(search.Name))
                        query = query.Where(x => x.Name.Contains(search.Name));

                    if (!string.IsNullOrEmpty(search.Code))
                        query = query.Where(x => x.Code.Contains(search.Code));

                    if (search.IsShow != null)
                        query = query.Where(x => x.IsShow == search.IsShow);
                }

                query = query.OrderBy(x => x.Order);
                return await PagedList<ModuleDto>.CreateAsync(query, search);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve module data: " + ex.Message);
            }
        }

        public async Task<ModuleDto> GetDto(Guid id)
        {
            try
            {
                var item = await (from q in GetQueryable().Where(x => x.Id == id)
                                  select new ModuleDto
                                  {
                                      CreatedId = q.CreatedId,
                                      UpdatedId = q.UpdatedId,
                                      Order = q.Order,
                                      IsShow = q.IsShow,
                                      AllowFilterScope = q.AllowFilterScope,
                                      IsMobile = q.IsMobile,
                                      Code = q.Code,
                                      Name = q.Name,
                                      Icon = q.Icon,
                                      ClassCss = q.ClassCss,
                                      StyleCss = q.StyleCss,
                                      Link = q.Link,
                                      CreatedBy = q.CreatedBy,
                                      UpdatedBy = q.UpdatedBy,
                                      IsDeleted = q.IsDeleted,
                                      DeletedId = q.DeletedId,
                                      CreatedDate = q.CreatedDate,
                                      UpdatedDate = q.UpdatedDate,
                                      DeletedDate = q.DeletedDate,
                                      Id = q.Id,
                                  }).FirstOrDefaultAsync();

                return item ?? throw new Exception("Module not found for ID: " + id);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve module DTO: " + ex.Message);
            }
        }

        public async Task<List<DropdownOption>> GetDropDown(string? selected)
        {
            try
            {
                return await GetQueryable().Select(x => new DropdownOption
                {
                    Label = x.Name,
                    Value = x.Id.ToString(),
                    Selected = selected != null ? selected == x.Code : false
                }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve dropdown options: " + ex.Message);
            }
        }

        public async Task<List<ModuleGroup>> GetModuleGroupData(Guid roleId)
        {
            try
            {
                var roleOperations = _roleOperationRepository.GetQueryable()
                                     .Where(r => r.RoleId == roleId)
                                     .Select(r => r.OperationId)
                                     .ToHashSet();

                var data = await (from module in GetQueryable()
                                  join operation in _operationRepository.GetQueryable()
                                      on module.Id equals operation.ModuleId
                                      into operationGroup
                                  from op in operationGroup.DefaultIfEmpty()
                                  select new { Module = module, Operation = op })
                                  .ToListAsync();

                return data.GroupBy(x => x.Module.Id)
                           .Select(g => new ModuleGroup
                           {
                               ModuleId = g.First().Module.Id,
                               ModuleName = g.First().Module.Name,
                               ModuleCode = g.First().Module.Code,
                               Operations = g.Where(x => x.Operation != null)
                                             .Select(x => new OperationDto
                                             {
                                                 Id = x.Operation.Id,
                                                 Name = x.Operation.Name,
                                                 Code = x.Operation.Code,
                                                 IsAccess = roleOperations.Contains(x.Operation.Id)
                                             })
                                             .Distinct()
                                             .ToList()
                           })
                           .ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve module group data: " + ex.Message);
            }
        }
    }
}