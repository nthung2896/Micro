using CommonHelper.Excel;
using CommonHelper.String;
using CommonHelper.Extenions;
using Hinet.Api.Dto;
using Hinet.Api.Filter;
using Hinet.Model.Entities;
using Hinet.Service.AppUserService.Dto;
using Hinet.Service.AspNetUsersService;
using Hinet.Service.AspNetUsersService.Dto;
using Hinet.Service.AspNetUsersService.Request;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.DM_DuLieuDanhMucService;
using Hinet.Service.Dto;
using Hinet.Service.RoleService;
using Hinet.Service.UserRoleService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Net.WebSockets;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class AspNetUsersController : HinetController
    {
        private readonly IAspNetUsersService _aspNetUsersService;
        private readonly IMapper _mapper;
        private readonly ILogger<AspNetUsersController> _logger;
        private readonly UserManager<AppUser> _userManager;
        private readonly IRoleService _roleService;
        private readonly IUserRoleService _userRoleService;
        private readonly IDM_DuLieuDanhMucService _dM_DuLieuDanhMucService;


        public AspNetUsersController(
            IAspNetUsersService aspNetUsersService,
            IMapper mapper,
            IDM_DuLieuDanhMucService dM_DuLieuDanhMucService,
            ILogger<AspNetUsersController> logger,
            UserManager<AppUser> userManager,
            IRoleService roleService,
            IUserRoleService userRoleService
            )
        {
            _aspNetUsersService = aspNetUsersService;
            _mapper = mapper;
            _dM_DuLieuDanhMucService = dM_DuLieuDanhMucService;
            _logger = logger;
            _userManager = userManager;
            _roleService = roleService;
            _userRoleService = userRoleService;
        }


        [HttpPost("Create")]
        public async Task<DataResponse<AppUser>> Create([FromBody] AspNetUsersRequest model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var result = await _aspNetUsersService.CreateAccount(model);

                    if (result.IsSuccess)
                    {
                        return new DataResponse<AppUser>()
                        {
                            Data = result.Data,
                            Status = true,
                            Message = "Tạo tài khoản thành công"
                        };
                    }
                    else
                    {
                        return DataResponse<AppUser>.False("Thêm mới thất bại", result.Errors);
                    }
                }
                catch (Exception ex)
                {
                    return DataResponse<AppUser>.False("Lỗi hệ thống", new string[] { ex.Message });
                }
            }

            return DataResponse<AppUser>.False("Dữ liệu đầu vào không hợp lệ", ModelStateError);
        }

        [HttpPut("Update")]
        public async Task<DataResponse<AppUser>> Update([FromBody] AspNetUsersRequest model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var entity = await _aspNetUsersService.GetByIdAsync(model.Id);
                    if (entity == null)
                        return DataResponse<AppUser>.False("Người dùng không tồn tại");

                    entity.Name = model.Name;
                    entity.DonViId = model.DonViId;
                    entity.PhoneNumber = model.PhoneNumber;
                    entity.NgaySinh = model.NgaySinh;
                    entity.Gender = int.TryParse(model.Gender, out int dd) ? dd : 1;
                    entity.DiaChi = model.DiaChi;
                    entity.Email = model.Email;

                    await _aspNetUsersService.UpdateAsync(entity);

                    return new DataResponse<AppUser>() { Data = entity, Status = true };
                }
                catch (Exception ex)
                {
                    DataResponse<AppUser>.False(ex.Message);
                }
            }
            return DataResponse<AppUser>.False("Dữ liệu không hợp lệ", ModelStateError);
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<AspNetUsersDto>> Get(Guid id)
        {
            var result = await _aspNetUsersService.GetDto(id);
            return new DataResponse<AspNetUsersDto>
            {
                Data = result,
                Message = "Get AspNetUsersDto thành công",
                Status = true
            };
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<AppUserDto>>> GetData([FromBody] AspNetUsersSearch search)
        {
            var userDto = new AppUserDto();

            var result = await _aspNetUsersService.GetData(search, userDto);

            return new DataResponse<PagedList<AppUserDto>>
            {
                Data = result,
                Message = "GetData PagedList<AppUserDto> thành công",
                Status = true
            };
        }

        [HttpPost("GetListUserByRole")]
        public async Task<DataResponse<PagedList<AppUserDto>>> GetListUserByRole([FromBody] AspNetUsersSearch search)
        {
            var userDto = new AppUserDto();
            userDto.Id = UserId ?? new Guid();

            if (HasRole(RoleConstant.Admin))
            {
                userDto = null;
            }

            var result = await _aspNetUsersService.GetData(search, userDto);

            return new DataResponse<PagedList<AppUserDto>>
            {
                Data = result,
                Message = "GetData PagedList<AppUserDto> thành công",
                Status = true
            };
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _aspNetUsersService.GetByIdAsync(id);
                await _aspNetUsersService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                return DataResponse.False(ex.Message);
            }
        }

        [HttpDelete("Lock/{id}")]
        public async Task<DataResponse> LockUser(Guid id)
        {
            var obj = await _aspNetUsersService.GetByIdAsync(id);
            if (obj == null)
            {
                return DataResponse.False("Không tìm thấy thông tin tài khoản");
            }
            try
            {
                obj.LockoutEnabled = !obj.LockoutEnabled;
                if (obj.LockoutEnabled)
                {
                    obj.LockoutEnd = DateTime.Now.AddDays(1);
                    obj.AccessFailedCount = 100;
                }
                else
                {
                    obj.LockoutEnd = null;
                    obj.AccessFailedCount = 0;
                }
                await _aspNetUsersService.UpdateAsync(obj);
            }
            catch (Exception ex)
            {
                return DataResponse.False("Không khóa/mở khóa được tài khoản");
            }
            return DataResponse.Success(null);
        }

        [HttpPost("export")]
        public async Task<DataResponse> ExportExcel([FromBody] AspNetUsersSearch search)
        {
            try
            {
                //var search = new AspNetUsersSearch();
                //search.PageIndex = 1;
                //search.PageSize = 20;
                //var data = await _aspNetUsersService.GetData(search);
                //var base64Excel = await ExportExcelHelperNetCore.Export<AppUserDto>(data?.Data?.Items);

                var exportData = await _aspNetUsersService.GetData(search);

                var base64Excel = exportData != null && exportData?.Items != null
                         ? ExportExcelHelperNetCore.ExportExcel(exportData.Items)
                            : null;
                if (string.IsNullOrEmpty(base64Excel))
                {
                    return DataResponse.False("Kết xuất thất bại hoặc dữ liệu trống");
                }
                return DataResponse.Success(base64Excel);
            }
            catch (Exception ex)
            {
                return DataResponse.False("Kết xuất thất bại");
            }
        }

        [HttpPost("CreateQuickAccountForDepartments")]
        public async Task<DataResponse> CreateQuickAccountForDepartments()
        {
            try
            {
                var departmentService = HttpContext.RequestServices.GetService<Hinet.Service.DepartmentService.IDepartmentService>();
                if (departmentService == null)
                    return DataResponse.False("Lỗi không tìm thấy DepartmentService");

                var roles = _roleService.GetQueryable().ToList();
                var qlnsRole = roles.FirstOrDefault(x => x.Code == "QLNS_DonVi");
                if (qlnsRole == null)
                {
                    qlnsRole = new Hinet.Model.Entities.Role
                    {
                        Id = Guid.NewGuid(),
                        Code = "QLNS_DonVi",
                        Name = "Quản lý nhân sự đơn vị",
                        IsActive = true
                    };
                    await _roleService.CreateAsync(qlnsRole);
                }

                var roleManager = HttpContext.RequestServices.GetService<RoleManager<AppRole>>();
                if (roleManager != null)
                {
                    var roleExists = await roleManager.RoleExistsAsync("QLNS_DonVi");
                    if (!roleExists)
                    {
                        await roleManager.CreateAsync(new AppRole { Id = Guid.NewGuid(), Name = "QLNS_DonVi", NormalizedName = "QNLS_DONVI" });
                    }
                }

                // Chỉ tạo tài khoản QLNS cho cấp Đơn vị (Bộ, Cục, Vụ, Viện, Trường...), không tạo cho cấp Phòng ban
                var departments = departmentService.GetQueryable()
                    .Where(x => x.IsActive && x.Level <= 1 && x.Loai != DepartmentTypeConstant.Phong && x.Loai != "PHONG_BAN")
                    .ToList();
                int successCount = 0;
                int skipCount = 0;
                var errors = new List<string>();

                foreach (var dept in departments)
                {
                    string rawCode = dept.Code ?? dept.Id.ToString().Substring(0, 8);
                    string cleanCode = System.Text.RegularExpressions.Regex.Replace(rawCode.ConvertToUnsign(), @"[^a-zA-Z0-9]", "");
                    string userName = $"qlns_{cleanCode}".ToLower();
                    
                    var existingUser = await _userManager.FindByNameAsync(userName);
                    if (existingUser == null)
                    {
                        var req = new AspNetUsersRequest
                        {
                            UserName = userName,
                            Name = $"QLNS {dept.Name}",
                            Email = $"{userName}@example.com",
                            MatKhau = "12345678",
                            DonViId = dept.Id,
                            VaiTro = new List<string> { "QLNS_DonVi" },
                            Gender = "1",
                            AccessFailedCount = 0,
                            EmailConfirmed = true,
                            PhoneNumberConfirmed = true,
                            TwoFactorEnabled = false,
                            LockoutEnabled = false
                        };

                        var result = await _aspNetUsersService.CreateAccount(req);
                        if (result.IsSuccess)
                        {
                            if (result.Data != null)
                            {
                                var userRole = new Hinet.Model.Entities.UserRole();
                                userRole.UserId = result.Data.Id;
                                userRole.RoleId = qlnsRole.Id;
                                userRole.DepartmentId = dept.Id;
                                await _userRoleService.CreateAsync(userRole);
                            }
                            
                            successCount++;
                        }
                        else
                        {
                            errors.Add($"Lỗi tạo tài khoản cho đơn vị {dept.Name}: {string.Join(", ", result.Errors)}");
                        }
                    }
                    else
                    {
                        var hasRole = await _userRoleService.GetQueryable().AnyAsync(x => x.UserId == existingUser.Id && x.RoleId == qlnsRole.Id);
                        if (!hasRole)
                        {
                            var userRole = new Hinet.Model.Entities.UserRole();
                            userRole.UserId = existingUser.Id;
                            userRole.RoleId = qlnsRole.Id;
                            userRole.DepartmentId = dept.Id;
                            await _userRoleService.CreateAsync(userRole);
                        }
                        
                        skipCount++;
                    }
                }

                return DataResponse.Success(new {
                    SuccessCount = successCount,
                    SkipCount = skipCount,
                    Errors = errors
                });
            }
            catch (Exception ex)
            {
                return DataResponse.False("Đã xảy ra lỗi: " + ex.Message);
            }
        }


        [HttpPost("CreateCucTruongAccountForDepartments")]
        public async Task<DataResponse> CreateCucTruongAccountForDepartments()
        {
            return await CreateAccountsForRoleInternal(
                RoleConstant.CucTruong,
                "Cục trưởng",
                "cuctruong",
                "Cục trưởng",
                dept => dept.Name.ToLower().Contains("cục")
            );
        }

        [HttpPost("CreatePhoCucTruongAccountForDepartments")]
        [HttpPost("CreateCucPhoAccountForDepartments")]
        public async Task<DataResponse> CreatePhoCucTruongAccountForDepartments()
        {
            return await CreateAccountsForRoleInternal(
                RoleConstant.PhoCucTruong,
                "Phó Cục trưởng",
                "phocuctruong",
                "Phó Cục trưởng",
                dept => dept.Name.ToLower().Contains("cục")
            );
        }

        [HttpPost("CreateTruongPhongAccountForDepartments")]
        public async Task<DataResponse> CreateTruongPhongAccountForDepartments()
        {
            return await CreateAccountsForRoleInternal(
                RoleConstant.TruongPhong,
                "Trưởng phòng",
                "truongphong",
                "Trưởng phòng",
                dept => true
            );
        }

        [HttpPost("CreatePhoTruongPhongAccountForDepartments")]
        public async Task<DataResponse> CreatePhoTruongPhongAccountForDepartments()
        {
            return await CreateAccountsForRoleInternal(
                RoleConstant.PhoTruongPhong,
                "Phó Trưởng phòng",
                "photruongphong",
                "Phó Trưởng phòng",
                dept => true
            );
        }

        [HttpPost("CreateAllLeadershipAccounts")]
        public async Task<DataResponse> CreateAllLeadershipAccounts()
        {
            try
            {
                var ctRes = await CreateCucTruongAccountForDepartments();
                var pctRes = await CreatePhoCucTruongAccountForDepartments();
                var tpRes = await CreateTruongPhongAccountForDepartments();
                var ptpRes = await CreatePhoTruongPhongAccountForDepartments();

                return DataResponse.Success(new
                {
                    CucTruong = ctRes.Data,
                    PhoCucTruong = pctRes.Data,
                    TruongPhong = tpRes.Data,
                    PhoTruongPhong = ptpRes.Data
                });
            }
            catch (Exception ex)
            {
                return DataResponse.False("Đã xảy ra lỗi khi tạo tài khoản lãnh đạo: " + ex.Message);
            }
        }

        private async Task<DataResponse> CreateAccountsForRoleInternal(
            string roleCode,
            string roleDisplayName,
            string usernamePrefix,
            string namePrefix,
            Func<Hinet.Model.Entities.Department, bool> departmentFilter)
        {
            try
            {
                var departmentService = HttpContext.RequestServices.GetService<Hinet.Service.DepartmentService.IDepartmentService>();
                if (departmentService == null)
                    return DataResponse.False("Lỗi không tìm thấy DepartmentService");

                var roles = _roleService.GetQueryable().ToList();
                var targetRole = roles.FirstOrDefault(x => x.Code == roleCode);
                if (targetRole == null)
                {
                    targetRole = new Hinet.Model.Entities.Role
                    {
                        Id = Guid.NewGuid(),
                        Code = roleCode,
                        Name = roleDisplayName,
                        IsActive = true
                    };
                    await _roleService.CreateAsync(targetRole);
                }

                var roleManager = HttpContext.RequestServices.GetService<RoleManager<AppRole>>();
                if (roleManager != null)
                {
                    var roleExists = await roleManager.RoleExistsAsync(roleCode);
                    if (!roleExists)
                    {
                        await roleManager.CreateAsync(new AppRole
                        {
                            Id = Guid.NewGuid(),
                            Name = roleCode,
                            NormalizedName = roleCode.ToUpper()
                        });
                    }
                }

                var allDepartments = departmentService.GetQueryable().ToList();
                var departments = allDepartments.Where(departmentFilter).ToList();
                if (!departments.Any())
                {
                    departments = allDepartments;
                }

                int successCount = 0;
                int skipCount = 0;
                var errors = new List<string>();

                foreach (var dept in departments)
                {
                    string rawCode = dept.Code ?? dept.Id.ToString().Substring(0, 8);
                    string cleanCode = System.Text.RegularExpressions.Regex.Replace(rawCode.ConvertToUnsign(), @"[^a-zA-Z0-9]", "");
                    string userName = $"{usernamePrefix}_{cleanCode}".ToLower();

                    var existingUser = await _userManager.FindByNameAsync(userName);
                    if (existingUser == null)
                    {
                        var req = new AspNetUsersRequest
                        {
                            UserName = userName,
                            Name = $"{namePrefix} {dept.Name}",
                            Email = $"{userName}@hinet.com.vn",
                            MatKhau = "12345678",
                            DonViId = dept.Id,
                            VaiTro = new List<string> { roleCode },
                            Gender = "1",
                            AccessFailedCount = 0,
                            EmailConfirmed = true,
                            PhoneNumberConfirmed = true,
                            TwoFactorEnabled = false,
                            LockoutEnabled = false,
                            Type = "Cán bộ"
                        };

                        var result = await _aspNetUsersService.CreateAccount(req);
                        if (result.IsSuccess)
                        {
                            if (result.Data != null)
                            {
                                var userRole = new Hinet.Model.Entities.UserRole();
                                userRole.UserId = result.Data.Id;
                                userRole.RoleId = targetRole.Id;
                                userRole.DepartmentId = dept.Id;
                                await _userRoleService.CreateAsync(userRole);
                            }

                            successCount++;
                        }
                        else
                        {
                            errors.Add($"Lỗi tạo tài khoản cho phòng ban {dept.Name}: {string.Join(", ", result.Errors)}");
                        }
                    }
                    else
                    {
                        var hasRole = await _userRoleService.GetQueryable().AnyAsync(x => x.UserId == existingUser.Id && x.RoleId == targetRole.Id);
                        if (!hasRole)
                        {
                            var userRole = new Hinet.Model.Entities.UserRole();
                            userRole.UserId = existingUser.Id;
                            userRole.RoleId = targetRole.Id;
                            userRole.DepartmentId = dept.Id;
                            await _userRoleService.CreateAsync(userRole);
                        }

                        if (roleManager != null)
                        {
                            var inRole = await _userManager.IsInRoleAsync(existingUser, roleCode);
                            if (!inRole)
                            {
                                await _userManager.AddToRoleAsync(existingUser, roleCode);
                            }
                        }

                        skipCount++;
                    }
                }

                return DataResponse.Success(new
                {
                    Role = roleCode,
                    SuccessCount = successCount,
                    SkipCount = skipCount,
                    Errors = errors
                });
            }
            catch (Exception ex)
            {
                return DataResponse.False("Đã xảy ra lỗi: " + ex.Message);
            }
        }

        [HttpGet("GetDropDown")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdown()
        {
            var thuongHieuDropdown = await _aspNetUsersService.GetQueryable().Select(x => new DropdownOption
            {
                Label = string.IsNullOrEmpty(x.Name) ? x.UserName : x.Name,
                Value = x.Id.ToString().ToLower()
            }).ToListAsync();
            return new DataResponse<List<DropdownOption>>() { Data = thuongHieuDropdown, Status = true };
        }

        [HttpPost("GetUserByRole")]
        public async Task<DataResponse<PagedList<AppUserDto>>> GetUserByRole([FromBody] AspNetUsersSearch search)
        {
            search.CurrentUserId = UserId;
            search.CurrentUserRoles = Roles;
            var user = await _aspNetUsersService.GetUserByRole(search);
            return new DataResponse<PagedList<AppUserDto>>() { Data = user, Status = true };
        }

        [HttpGet("GetCanBoByDonVi")]
        public async Task<DataResponse<List<DropdownOption>>> GetCanBoByDonVi([FromQuery] Guid donViId)
        {
            var data = await _aspNetUsersService.GetCanBoByDonViId(donViId);

            if (data.IsSuccess)
            {
                return DataResponse<List<DropdownOption>>.Success(data.Data, data.Message);
            }
            else
            {
                return DataResponse<List<DropdownOption>>.False(data.Message);
            }
        }

        /// <summary>
        /// API tự động gán vai trò "Cá nhân" (CaNhan) cho tất cả các tài khoản chưa được gán vai trò nào
        /// </summary>
        [HttpPost("SetDefaultRoleCaNhanForUsersWithoutRole")]
        public async Task<DataResponse<int>> SetDefaultRoleCaNhanForUsersWithoutRole()
        {
            var response = new DataResponse<int>();
            try
            {
                var count = await _aspNetUsersService.SetDefaultRoleCaNhanForUsersWithoutRole();
                response.Data = count;
                response.Status = true;
                response.Message = $"Đã gán thành công vai trò 'Cá nhân' cho {count} tài khoản chưa có vai trò.";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }
    }
}
