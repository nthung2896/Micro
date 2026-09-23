using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.UserRoleService;
using Hinet.Service.UserRoleService.Dto;
using Hinet.Service.UserRoleService.Request;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using System;
using Hinet.Service.RoleService;
using Hinet.Service.DepartmentService;
using StackExchange.Redis;
using System.Data;
//using Hinet.Service.GroupRoleService;
using System.Collections.Generic;
using Hinet.Service.AppUserService;
using Hinet.Api.Dto;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class UserRoleController : HinetController
    {
        private readonly IUserRoleService _userRoleService;
        private readonly IRoleService _roleService;
        private readonly IDepartmentService _departmentService;
        //private readonly IGroupRoleService _groupRoleService;
        private readonly IAppUserService _appUserService;

        private readonly IMapper _mapper;
        private readonly ILogger<UserRoleController> _logger;

        public UserRoleController(
            IUserRoleService userRoleService,
            IMapper mapper,
            ILogger<UserRoleController> logger
            , IRoleService roleService,
            IDepartmentService departmentService,
            //IGroupRoleService groupRoleService,
            IAppUserService appUserService)
        {
            this._userRoleService = userRoleService;
            this._mapper = mapper;
            _logger = logger;
            _roleService = roleService;
            _departmentService = departmentService;
            //_groupRoleService = groupRoleService;
            _appUserService = appUserService;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<UserRole>> Create([FromBody] UserRoleRequest model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    //lấy các quyền đang có trong hệ thống
                    var listRole = _roleService.GetQueryable().ToList();

                    // các mã quyền hiện tại
                    var listUserRoleCode = _userRoleService.GetListRoleCodeByUserId(model.UserId);

                    // các quyền được thêm mới
                    var listNewRoleCode = (model.RoleCode ?? new List<string>())
                                        .Except(listUserRoleCode ?? new List<string>())
                                        .ToList();
                    // các quyền bị xóa
                    var listDeletedRoleCode = (listUserRoleCode ?? new List<string>())
                                            .Except(model.RoleCode ?? new List<string>())
                                            .ToList();

                    // thêm mới các quyền cho acc
                    if (listNewRoleCode != null && listNewRoleCode.Any())
                    {
                        var listUserRole = new List<UserRole>();
                        foreach (var item in listNewRoleCode)
                        {
                            var roleId = listRole.FirstOrDefault(x => x.Code == item)?.Id;
                            if (roleId != null)
                            {
                                var userRole = new UserRole();
                                userRole.UserId = model.UserId;
                                userRole.RoleId = (Guid)roleId;
                                listUserRole.Add(userRole);
                            }
                        }
                        if (listUserRole != null && listUserRole.Any())
                        {
                            await _userRoleService.CreateRange(listUserRole);
                        }
                    }

                    // xóa các quyền cho acc
                    if (listDeletedRoleCode != null && listDeletedRoleCode.Any())
                    {
                        var listIdRoleDeleted = listRole
                            .Where(x => listDeletedRoleCode.Contains(x.Code))
                            .Select(x => x.Id)
                            .ToList();

                        var listUserRoleDeleted = _userRoleService.GetQueryable()
                            .Where(x => x.UserId == model.UserId &&
                            listIdRoleDeleted.Contains(x.RoleId))
                            .ToList();

                        if (listUserRoleDeleted != null && listUserRoleDeleted.Any())
                        {
                            await _userRoleService.DeleteRange(listUserRoleDeleted);
                        }
                    }

                    return DataResponse<UserRole>.Success(null, "");
                }
                catch (Exception ex)
                {
                    return DataResponse<UserRole>.False("Error", new string[] { ex.Message });
                }
            }
            return DataResponse<UserRole>.False("Some properties are not valid", ModelStateError);
        }

        [HttpPost("Update")]
        public async Task<DataResponse<UserRole>> Update([FromBody] UserRoleRequest model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var entity = await _userRoleService.GetByIdAsync(model.Id);
                    if (entity == null)
                        return DataResponse<UserRole>.False("UserRole not found");

                    entity = _mapper.Map(model, entity);
                    await _userRoleService.UpdateAsync(entity);
                    return new DataResponse<UserRole>() { Data = entity, Status = true };
                }
                catch (Exception ex)
                {
                    DataResponse<UserRole>.False(ex.Message);
                }
            }
            return DataResponse<UserRole>.False("Some properties are not valid", ModelStateError);
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<UserRoleDto>> Get(Guid id)
        {
            var result = await _userRoleService.GetDto(id);
            return new DataResponse<UserRoleDto>
            {
                Data = result,
                Message = "Get UserRoleDto thành công",
                Status = true
            };
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<UserRoleDto>>> GetData([FromBody] UserRoleSearch search)
        {
            var result = await _userRoleService.GetData(search);
            return new DataResponse<PagedList<UserRoleDto>>
            {
                Data = result,
                Message = "GetData PagedList<UserRoleDto> thành công",
                Status = true
            };
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _userRoleService.GetByIdAsync(id);
                await _userRoleService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                return DataResponse.False(ex.Message);
            }
        }

        [HttpPost("CreateNew")]
        public async Task<DataResponse<List<UserRole>>> CreateNew([FromBody] UserRoleRequest_GanNguoi model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var listRoleAdd = new List<UserRole>();
                    if (model.ListDataRole != null && model.ListDataRole.Any())
                    {
                        foreach (var item in model.ListDataRole)
                        {
                            var obj = new UserRole();
                            obj.UserId = model.UserId;
                            obj.RoleId = item;

                            var objTonTai = _userRoleService.GetByUserAndRole(model.UserId, item);
                            if (objTonTai == null)
                            {
                                listRoleAdd.Add(obj);
                                await _userRoleService.CreateAsync(obj);
                            }
                        }

                        var listTonTaiTheoUserId = _userRoleService.GetByUser(model.UserId);
                        var listBiXoa = listTonTaiTheoUserId.Where(x => !model.ListDataRole.Contains(x.RoleId)).ToList();
                        foreach (var item in listBiXoa)
                        {
                            await _userRoleService.DeleteAsync(item);
                        }
                    }
                    else
                    {
                        var listXoa = _userRoleService.GetByUser(model.UserId);
                        await _userRoleService.DeleteAsync(listXoa);
                    }
                    return new DataResponse<List<UserRole>>() { Data = listRoleAdd, Status = true };
                }
                catch (Exception ex)
                {
                    return DataResponse<List<UserRole>>.False("Error", new string[] { ex.Message });
                }
            }
            return DataResponse<List<UserRole>>.False("Some properties are not valid", ModelStateError);
        }

        [HttpPost("SetupRole")]
        public async Task<DataResponse<UserRoleVM>> SetupRole(Guid id)
        {
            var result = await _userRoleService.GetUserRoleVM(id);
            return new DataResponse<UserRoleVM>
            {
                Data = result,
                Message = "SetupRole UserRoleVM thành công",
                Status = true
            };
        }

        [HttpPost("CreateBulk")]
        public async Task<DataResponse<List<UserRole>>> CreateBulk([FromBody] UserRoleBulkRequest model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // Delete all existing user roles for this user first (edit mode)
                    var existingRoles = _userRoleService.GetQueryable()
                        .Where(x => x.UserId == model.UserId)
                        .ToList();

                    if (existingRoles.Any())
                    {
                        await _userRoleService.DeleteRange(existingRoles);
                    }

                    // Create new roles
                    var listRole = _roleService.GetQueryable().ToList();
                    var createdRecords = new List<UserRole>();

                    foreach (var permission in model.Permissions)
                    {
                        if (permission.RoleCodes != null && permission.RoleCodes.Any())
                        {
                            foreach (var roleCode in permission.RoleCodes)
                            {
                                var roleId = listRole.FirstOrDefault(x => x.Code == roleCode)?.Id;
                                if (roleId != null)
                                {
                                    var userRole = new UserRole
                                    {
                                        UserId = model.UserId,
                                        RoleId = (Guid)roleId,
                                        DepartmentId = permission.DepartmentId,
                                        KhoiCode = permission.KhoiCode
                                    };
                                    await _userRoleService.CreateAsync(userRole);
                                    createdRecords.Add(userRole);
                                }
                            }
                        }
                    }

                    return new DataResponse<List<UserRole>>
                    {
                        Data = createdRecords,
                        Status = true,
                        Message = "Phân quyền thành công"
                    };
                }
                catch (Exception ex)
                {
                    return DataResponse<List<UserRole>>.False("Error", new string[] { ex.Message });
                }
            }
            return DataResponse<List<UserRole>>.False("Some properties are not valid", ModelStateError);
        }

        [HttpGet("GetDropdownKCQCN")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdownKCQCN()
        {
            try
            {
                var listdata = await _departmentService.GetDropdownListKCQCN();
                return DataResponse<List<DropdownOption>>.Success(listdata);
            }
            catch (Exception e)
            {
                return DataResponse<List<DropdownOption>>.False(e.Message);
            }
        }

        [HttpGet("GetDropdownPhongByKCQCN")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdownPhongByKCQCN(string codes)
        {
            try
            {
                var codeList = new List<string>();
                if (!string.IsNullOrEmpty(codes))
                {
                    codeList = codes.Split(',')
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .Select(x => x.Trim())
                        .ToList();
                }
                var listdata = await _departmentService.GropdownDownPhongByKCQCN(codeList);
                return DataResponse<List<DropdownOption>>.Success(listdata);
            }
            catch (Exception e)
            {
                return DataResponse<List<DropdownOption>>.False(e.Message);
            }
        }

        [HttpGet("GetUserPermissions/{userId}")]
        public async Task<DataResponse<List<UserPermissionDto>>> GetUserPermissions(Guid userId)
        {
            try
            {
                // Get all user roles for this user
                var userRoles = _userRoleService.GetQueryable()
                    .Where(x => x.UserId == userId)
                    .ToList();

                if (userRoles == null || !userRoles.Any())
                {
                    return DataResponse<List<UserPermissionDto>>.Success(new List<UserPermissionDto>());
                }

                // Get all roles and departments
                var allRoles = _roleService.GetQueryable().ToList();
                var allDepartments = _departmentService.GetQueryable().ToList();

                var result = new List<UserPermissionDto>();

                // Group by department (assuming UserRole has DepartmentId, if not we need to adjust)
                // For now, if UserRole doesn't have department info, we'll return ungrouped roles
                var groupedByDepartment = userRoles
                    .Where(ur => ur.DepartmentId != null && ur.DepartmentId != Guid.Empty)
                    .GroupBy(ur => ur.DepartmentId)
                    .ToList();

                foreach (var group in groupedByDepartment)
                {
                    var departmentId = group.Key;
                    var department = allDepartments.FirstOrDefault(d => d.Id == departmentId);

                    if (department != null)
                    {
                        // Find parent Khoi
                        var khoiCode = "";
                        var parentDept = allDepartments.FirstOrDefault(d => d.Id == department.ParentId);
                        if (parentDept != null)
                        {
                            khoiCode = parentDept.Code;
                        }

                        // Get role codes for this department
                        var roleCodes = group
                            .Select(ur => allRoles.FirstOrDefault(r => r.Id == ur.RoleId)?.Code)
                            .Where(code => !string.IsNullOrEmpty(code))
                            .ToList();

                        result.Add(new UserPermissionDto
                        {
                            KhoiCode = khoiCode,
                            DepartmentId = departmentId,
                            RoleCodes = roleCodes
                        });
                    }
                }

                return DataResponse<List<UserPermissionDto>>.Success(result);
            }
            catch (Exception e)
            {
                return DataResponse<List<UserPermissionDto>>.False(e.Message);
            }
        }
    }
}