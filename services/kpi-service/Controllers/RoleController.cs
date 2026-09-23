using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.RoleService;
using Hinet.Service.RoleService.Dto;
using Hinet.Service.RoleService.Request;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Hinet.Service.UserRoleService.Dto;
using Hinet.Service.RoleOperationService;
using Role = Hinet.Model.Entities.Role;
using Hinet.Api.Filter;
using Hinet.Service.OperationService.Dto;
using Hinet.Api.Dto;
using Hinet.Service.Constant;
using Hinet.Service.AppUserService.Dto;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class RoleController : HinetController
    {
        private readonly IRoleService _roleService;
        private readonly IMapper _mapper;
        private readonly ILogger<RoleController> _logger;
        private IRoleOperationService _roleOperationService;

        public RoleController(
            IRoleService roleService,
            IMapper mapper,
            ILogger<RoleController> logger,
            IRoleOperationService roleOperationService
            )
        {
            this._roleService = roleService;
            this._mapper = mapper;
            _logger = logger;
            _roleOperationService = roleOperationService;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<Role>> Create([FromBody] RoleRequest model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var check = await _roleService.AnyAsync(x => x.Code == model.Code);
                    if (check)
                    {
                        return DataResponse<Role>.False("Mã nhóm quyền đã tồn tại");
                    }
                    var entity = _mapper.Map<RoleRequest, Role>(model);
                    entity.IsActive = true;
                    await _roleService.CreateAsync(entity);
                    return new DataResponse<Role>() { Data = entity, Status = true };
                }
                catch (Exception ex)
                {
                    return DataResponse<Role>.False("Error", new string[] { ex.Message });
                }
            }
            return DataResponse<Role>.False("Some properties are not valid", ModelStateError);
        }

        [HttpPut("Update")]
        public async Task<DataResponse<Role>> Update([FromBody] RoleRequest model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var entity = await _roleService.GetByIdAsync(model.Id);
                    if (entity == null)
                        return DataResponse<Role>.False("Role not found");
                    var check = await _roleService.AnyAsync(x => x.Code == model.Code && x.Id != model.Id);
                    if (check)
                    {
                        return DataResponse<Role>.False("Mã nhóm quyền đã tồn tại");
                    }
                    entity = _mapper.Map(model, entity);
                    await _roleService.UpdateAsync(entity);
                    return new DataResponse<Role>() { Data = entity, Status = true };
                }
                catch (Exception ex)
                {
                    DataResponse<Role>.False(ex.Message);
                }
            }
            return DataResponse<Role>.False("Some properties are not valid", ModelStateError);
        }

        [HttpPut("SwitchActiveRole/{id}")]
        public async Task<DataResponse<Role>> SwitchActiveRole(Guid id)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var entity = await _roleService.GetByIdAsync(id);
                    if (entity == null)
                        return DataResponse<Role>.False("Role not found");

                    entity.IsActive = !entity.IsActive;

                    await _roleService.UpdateAsync(entity);

                    return new DataResponse<Role>() { Data = entity, Status = true };
                }
                catch (Exception ex)
                {
                    DataResponse<Role>.False(ex.Message);
                }
            }
            return DataResponse<Role>.False("Some properties are not valid", ModelStateError);
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<RoleDto>> Get(Guid id)
        {
            var result = await _roleService.GetDto(id);
            return new DataResponse<RoleDto>
            {
                Data = result,
                Message = "Get RoleDto thành công",
                Status = true
            };
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<RoleDto>>> GetData([FromBody] RoleSearch search)
        {
            if (search == null)
            {
                search = new RoleSearch();
            }



            var result = await _roleService.GetData(search);
            return new DataResponse<PagedList<RoleDto>>
            {
                Data = result,
                Message = "GetData PagedList<RoleDto> thành công",
                Status = true
            };
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _roleService.GetByIdAsync(id);
                await _roleService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                return DataResponse.False(ex.Message);
            }
        }

        [HttpPost("GetRole/{id}")]
        public async Task<DataResponse<List<RoleDto>>> GetRole(Guid id)
        {
            var result = await _roleService.GetRole(id);
            return new DataResponse<List<RoleDto>>
            {
                Data = result,
                Message = "GetRole List<RoleDto> thành công",
                Status = true
            };
        }

        [HttpPost("SaveConfigureOperation")]
        public async Task<DataResponse> SaveConfigureOperation(RoleOperationMultiRequest model)
        {
            try
            {
                var listRoleOperation = _roleOperationService.GetByRoleId(model.Id);
                await _roleOperationService.DeleteAsync(listRoleOperation);
                List<RoleOperation> configData = new List<RoleOperation>();
                var listThemMoi = new List<RoleOperation>();
                foreach (var operationId in model.ListOperation)
                {
                    RoleOperation config = new RoleOperation()
                    {
                        OperationId = operationId,
                        RoleId = model.Id,
                        IsAccess = 1,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now
                    };
                    listThemMoi.Add(config);
                }
                await _roleOperationService.CreateAsync(listThemMoi);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                return DataResponse.False(ex.Message);
            }
        }

        [HttpPost("GetDropVaiTro")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropVaiTro(string? selected)
        {

            var result = await _roleService.GetDropDownByUserDepartment(selected, null);
            return new DataResponse<List<DropdownOption>>
            {
                Data = result,
                Message = "GetDropVaiTro List<DropdownOption> thành công",
                Status = true
            };
        }

        [HttpPost("GetDropDownVaiTroIds")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropDownVaiTroIds(string? selected)
        {
            var result = await _roleService.GetDropDownVaiTroIds(selected);
            return new DataResponse<List<DropdownOption>>
            {
                Data = result,
                Message = "GetDropDownVaiTroIds List<DropdownOption> thành công",
                Status = true
            };
        }

        [HttpGet("GetDropdownId")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdownId()
        {
            var uid = HasRole(RoleConstant.Admin) ? null : UserId;
            var result = await _roleService.GetDropDownIdByUserDepartment(null, null);

            return new DataResponse<List<DropdownOption>>
            {
                Data = result,
                Message = "GetDropdownId List<GetDropdownOption> thành công",
                Status = true
            };
        }


    }
}