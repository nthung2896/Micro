using CommonHelper.Extenions;
using Hinet.Model.Entities;
using Hinet.Repository.AspNetUsersRepository;
using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.RoleRepository;
using Hinet.Repository.UserRoleRepository;
using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Service.AppUserService.Dto;
using Hinet.Service.AspNetUsersService.Dto;
using Hinet.Service.AspNetUsersService.Request;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.DepartmentService;
using Hinet.Service.DM_DuLieuDanhMucService;
using Hinet.Service.Dto;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Hinet.Repository.DM_NhomDanhMucRepository;

using Hinet.Repository.RoleOperationRepository;
using Hinet.Repository.OperationRepository;

namespace Hinet.Service.AspNetUsersService
{
    public class AspNetUsersService : Service<AppUser>, IAspNetUsersService
    {
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IDepartmentService _departmentService;
        private readonly UserManager<AppUser> _userManager;
        private readonly IMapper _mapper;
        private readonly IDM_DuLieuDanhMucRepository _dM_DuLieuDanhMucRepository;
        private readonly IDM_NhomDanhMucRepository _dM_NhomDanhMucRepository;
        private readonly IRoleOperationRepository _roleOperationRepository;
        private readonly IOperationRepository _operationRepository;
        private readonly Hinet.Service.Common.IdentityClient.IIdentityServiceClient _identityServiceClient;

        public AspNetUsersService(
            IAspNetUsersRepository aspNetUsersRepository,
            IUserRoleRepository userRoleRepository,
            IRoleRepository roleRepository,
            IDepartmentRepository departmentRepository,
            IDepartmentService departmentService,
            UserManager<AppUser> userManager,
            IMapper mapper,
            IDM_DuLieuDanhMucRepository dM_DuLieuDanhMucRepository,
            IDM_NhomDanhMucRepository dM_NhomDanhMucRepository,
            IRoleOperationRepository roleOperationRepository,
            IOperationRepository operationRepository,
            Hinet.Service.Common.IdentityClient.IIdentityServiceClient identityServiceClient) : base(aspNetUsersRepository)
        {
            _userRoleRepository = userRoleRepository;
            _roleRepository = roleRepository;
            _departmentRepository = departmentRepository;
            _departmentService = departmentService;
            _userManager = userManager;
            _mapper = mapper;
            _dM_DuLieuDanhMucRepository = dM_DuLieuDanhMucRepository;
            _dM_NhomDanhMucRepository = dM_NhomDanhMucRepository;
            _roleOperationRepository = roleOperationRepository;
            _operationRepository = operationRepository;
            _identityServiceClient = identityServiceClient;
        }

        public async Task<PagedList<AppUserDto>> GetData(AspNetUsersSearch search, AppUserDto userDto = null)
        {
            // lấy các phòng con
            //var deparmentIds = userDto != null ? 
            //    await _departmentRepository.GetQueryable()
            //        .Where(x => x.ParentId == userDto.DonViId)
            //        .Select(x => x.ItemId)
            //        .ToListAsync() : new List<Guid>();

            //var lstIds = new List<Guid>();
            //if (userDto != null && userDto.DonViId != null)
            //{
            //    lstIds.Add(userDto.DonViId ?? new Guid());
            //}

            //var deparmentIds = _departmentService.GetChildIds(lstIds);

            try
            {
                var query = from user in GetQueryable()

                            select new AppUserDto
                            {
                                LockoutEnabled = user.LockoutEnabled,
                                MaCanBo = user.MaCanBo,
                                Name = user.Name,
                                Gender = user.Gender,
                                Picture = user.Picture,
                                UserName = user.UserName,
                                PhoneNumber = user.PhoneNumber,
                                Email = user.Email,
                                Id = user.Id,
                                DiaChi = user.DiaChi,
                                DonViId = user.DonViId,
                                NgaySinh = user.NgaySinh,
                                Type = user.Type,
                                GioiTinh_txt = user.Gender == 1 ? "Nam" : "Nữ",
                                GroupRole_txt = user.GroupRole,
                                CreatedDate = user.CreatedDate,
                            };

                //if (userDto != null)
                //{
                //        query = query.Where(x => x.DonViId != null && deparmentIds.Contains((Guid)x.DonViId));
                //}

                //if (userDto != null && userDto.DonViId != Guid.Empty)
                //{
                //    query = query.Where(x => x.DonViId != null && x.DonViId == userDto.DonViId);
                //    query = query.Where(x => x.ItemId != userDto.ItemId);
                //}

                if (search != null)
                {
                    if (!string.IsNullOrEmpty(search.PhoneNumber))
                        query = query.Where(x => !string.IsNullOrEmpty(x.PhoneNumber) && x.PhoneNumber.Contains(search.PhoneNumber));

                    if (!string.IsNullOrEmpty(search.Email))
                        query = query.Where(x => !string.IsNullOrEmpty(x.Email) && x.Email.Contains(search.Email));

                    if (!string.IsNullOrEmpty(search.Name))
                        query = query.Where(x => !string.IsNullOrEmpty(x.Name) && x.Name.Contains(search.Name));

                    if (!string.IsNullOrEmpty(search.UserName))
                        query = query.Where(x => !string.IsNullOrEmpty(x.UserName) && x.UserName.Contains(search.UserName));

                    if (!string.IsNullOrEmpty(search.DiaChi))
                        query = query.Where(x => !string.IsNullOrEmpty(x.DiaChi) && x.DiaChi.Contains(search.DiaChi));

                    if (search.DonViId != null && search.ParentDonViId == null)
                        query = query.Where(x => x.DonViId == search.DonViId);

                    if (search.VaiTro != null && search.VaiTro.Any())
                    {
                        var lstRole = _roleRepository.GetQueryable().Where(x => search.VaiTro.Contains(x.Code)).Select(x => x.Id).ToList();
                        var listUserId = _userRoleRepository.GetQueryable().Where(x => lstRole.Contains(x.RoleId)).Select(x => x.UserId).ToList();
                        query = query.Where(x => x.Id.HasValue && listUserId.Contains(x.Id.Value));
                    }

                    if (!string.IsNullOrEmpty(search.Type))
                    {
                        query = query.Where(x => x.Type == search.Type);
                    }

                    if (search.DepartmentId != null)
                    {
                        query = query.Where(x => x.DonViId == search.DepartmentId);
                    }

                    if (!string.IsNullOrEmpty(search.Keyword))
                    {
                        var kw = search.Keyword;

                        query = query.Where(x =>
                         (!string.IsNullOrEmpty(x.Name) && x.Name.Contains(kw)) ||
                         (!string.IsNullOrEmpty(x.UserName) && x.UserName.Contains(kw))
                     );
                    }
                }

                query = query.OrderByDescending(x => x.CreatedDate);
                var result = await PagedList<AppUserDto>.CreateAsync(query, search);

                foreach (var item in result.Items)
                {
                    var listRoleId = _userRoleRepository.GetQueryable().Where(x => x.UserId == item.Id).Select(x => x.RoleId).ToList();
                    var listDepartmentId = _userRoleRepository.GetQueryable().Where(x => x.UserId == item.Id).Select(x => x.DepartmentId).ToList();

                    var lstRole = _roleRepository.GetQueryable().Where(x => listRoleId.Contains(x.Id)).ToList();
                    var listRoleCode = lstRole.Select(x => x.Code).ToList();
                    item.VaiTro_response = string.Join(",", listRoleCode);
                    item.VaiTro_txt_response = lstRole.Select(x => x.Name).ToList();
                    item.vaiTro = lstRole.Select(x => x.Code).ToList();

                    //var lstDept = _departmentRepository.GetQueryable().Where(x => listDepartmentId.Contains(x.ItemId)).ToList();
                    var lstDept = _departmentRepository.GetQueryable().Where(x => x.Id == item.DonViId).ToList();
                    item.ListPhongBan = lstDept.Select(x => x.Code).ToList();

                    item.GroupRole_response = !string.IsNullOrEmpty(item.GroupRole_txt) ? item.GroupRole_txt.Split(',').ToList() : new List<string>();

                    item.DepartmentId = lstDept.FirstOrDefault()?.Id.ToString() ?? string.Empty;
                    item.Department_txt = lstDept.FirstOrDefault()?.Name ?? string.Empty;
                }

                return result;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve user data: " + ex.Message);
            }
        }

        public async Task<AspNetUsersDto> GetDto(Guid id)
        {
            try
            {
                var item = await (from q in GetQueryable().Where(x => x.Id == id)
                                  select new AspNetUsersDto
                                  {
                                      UserId = q.Id,
                                      LockoutEnd = q.LockoutEnd,
                                      AccessFailedCount = q.AccessFailedCount,
                                      EmailConfirmed = q.EmailConfirmed,
                                      PhoneNumberConfirmed = q.PhoneNumberConfirmed,
                                      TwoFactorEnabled = q.TwoFactorEnabled,
                                      LockoutEnabled = q.LockoutEnabled,
                                      Name = q.Name,
                                      Gender = q.Gender,
                                      Picture = q.Picture,
                                      Type = q.Type,
                                      MaCanBo = q.MaCanBo,
                                      DonViId = q.DonViId,
                                      UserName = q.UserName,
                                      PhoneNumber = q.PhoneNumber,
                                      NormalizedUserName = q.NormalizedUserName,
                                      Email = q.Email,
                                      NormalizedEmail = q.NormalizedEmail,
                                      PasswordHash = q.PasswordHash,
                                      SecurityStamp = q.SecurityStamp,
                                      ConcurrencyStamp = q.ConcurrencyStamp,
                                      Id = q.Id,
                                  }).FirstOrDefaultAsync();

                return item ?? throw new Exception("User not found for ID: " + id);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve user DTO: " + ex.Message);
            }
        }

        public async Task<List<AppUser>> GetUserByCanBoIds(List<Guid> canboIds)
        {
            try
            {
                return await GetQueryable().Where(x => x.CanBoId != null && canboIds.Contains(x.CanBoId.Value)).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve users by CanBo IDs: " + ex.Message);
            }
        }

        public async Task<AppUser> GetUserByCanBoId(Guid? canboId)
        {
            try
            {
                return await GetQueryable().FirstOrDefaultAsync(x => x.CanBoId != null && x.CanBoId.Equals(canboId))
                    ?? throw new Exception("User not found for CanBo ID: " + canboId);
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve user by CanBo ID: " + ex.Message);
            }
        }
        public async Task<AppUser> GetUserByUserName(string userName)
        {
            try
            {
                return await GetQueryable().FirstOrDefaultAsync(x => x.UserName.Equals(userName))
                    ?? null;
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to retrieve user by CanBo ID: " + ex.Message);
            }
        }
        private static Guid ConvertToGuid(object id)
        {
            if (id is byte[] bytes)
            {
                // Kiểm tra độ dài mảng byte
                if (bytes.Length == 16)
                {
                    return new Guid(bytes); // Tạo Guid từ mảng byte 16 phần tử
                }
                else
                {
                    // Xử lý trường hợp độ dài không đúng (trả về Guid.Empty hoặc ghi log)
                    Console.WriteLine($"Invalid byte array length: {bytes.Length}");
                    return Guid.Empty;
                }
            }
            else if (id is string str)
            {
                return Guid.TryParse(str, out var guid) ? guid : Guid.Empty;
            }
            return Guid.Empty; // Trường hợp không xác định        }
        }
        public async Task<List<DropdownOption>> GetDropdownOptionsByRole(string RoleCode)
        {
            var query = await (from q in GetQueryable()
                               join ur in _userRoleRepository.GetQueryable()
                               on q.Id equals ur.UserId into Jur
                               from ur in Jur.DefaultIfEmpty()

                               join r in _roleRepository.GetQueryable()
                               on ur.RoleId equals r.Id into Jr
                               from r in Jr.DefaultIfEmpty()

                               where r.Code == RoleCode
                               select new DropdownOption
                               {
                                   Label = q.Name,
                                   Value = q.Id.ToString(),
                               }).ToListAsync();
            return query;
        }
        public async Task<List<DropdownOption>> GetDropdownOptionsDonViId(Guid DonViId)
        {
            var query = await (from q in GetQueryable()

                               where q.DonViId == DonViId
                               select new DropdownOption
                               {
                                   Label = q.Name,
                                   Value = q.Id.ToString(),
                               }).ToListAsync();
            return query;
        }

        public async Task<PagedList<AppUserDto>> GetUserByRole(AspNetUsersSearch search)
        {
            var query = from q in GetQueryable()
                        join ur in _userRoleRepository.GetQueryable()
                            on q.Id equals ur.UserId
                        join r in _roleRepository.GetQueryable()
                            on ur.RoleId equals r.Id
                        select new { q, r };

            if (search.VaiTro != null && search.VaiTro.Any())
            {
                query = query.Where(x => search.VaiTro.Contains(x.r.Code));
            }

            if (!string.IsNullOrEmpty(search.PermissionCode))
            {
                var roleOps = _roleOperationRepository.GetQueryable();
                var operations = _operationRepository.GetQueryable();

                var roleIdsWithPermission = from ro in roleOps
                                            join op in operations on ro.OperationId equals op.Id
                                            where op.Code == search.PermissionCode
                                            select ro.RoleId;

                query = query.Where(x => roleIdsWithPermission.Contains(x.r.Id));
            }

            if (search.CurrentUserId.HasValue)
            {
                var currentUser = await GetQueryable().FirstOrDefaultAsync(x => x.Id == search.CurrentUserId.Value);
                if (currentUser != null && currentUser.DonViId.HasValue)
                {
                    var isUserAtSo = search.CurrentUserRoles != null && search.CurrentUserRoles.Any(r => r.Contains("So"));
                    if (isUserAtSo)
                    {
                        query = query.Where(x => x.q.DonViId == currentUser.DonViId.Value);
                    }
                }
            }

            if (!string.IsNullOrEmpty(search.Keyword))
            {
                var keyword = search.Keyword.ToLower();
                query = query.Where(x =>
                    x.q.Name.ToLower().Contains(keyword) ||
                    x.q.Email.ToLower().Contains(keyword)
                );
            }

            if (!string.IsNullOrEmpty(search.Name))
            {
                query = query.Where(x => x.q.Name.Contains(search.Name));
            }

            if (!string.IsNullOrEmpty(search.Email))
            {
                query = query.Where(x => x.q.Email.Contains(search.Email));
            }

            var finalQuery = query
                .Select(x => x.q)
                .Distinct();

            var total = await finalQuery.CountAsync();

            var data = await finalQuery
                .OrderBy(x => x.Name)
                .Skip((search.PageIndex - 1) * search.PageSize)
                .Take(search.PageSize)
                .Select(x => new AppUserDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Email = x.Email,
                    PhoneNumber = x.PhoneNumber,
                    NgaySinh = x.NgaySinh,
                    MaCanBo = x.MaCanBo,
                    UserName = x.UserName,
                    DonViId = x.DonViId
                })
                .ToListAsync();

            return new PagedList<AppUserDto>(data, total, search.PageIndex, search.PageSize);
        }

        public async Task<(bool IsSuccess, AppUser? Data, List<string> Errors)> CreateAccount(AspNetUsersRequest model)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(model.UserName))
            {
                if (!string.IsNullOrWhiteSpace(model.Email))
                {
                    model.UserName = model.Email.Split('@')[0].Trim();
                }
                else
                {
                    model.UserName = "user_" + Guid.NewGuid().ToString("N").Substring(0, 6);
                }
            }

            if (!string.IsNullOrEmpty(model.UserName))
            {
                var isUserNameExist = await _userManager.Users.AnyAsync(x => x.UserName.ToLower() == model.UserName.ToLower());
                if (isUserNameExist)
                {
                    errors.Add("Username này đã tồn tại trong hệ thống.");
                    return (false, null, errors);
                }
            }

            if (!string.IsNullOrEmpty(model.MaCanBo))
            {
                var isMaCanBoExist = await _userManager.Users.AnyAsync(x => x.MaCanBo != null && x.MaCanBo.ToLower() == model.MaCanBo.ToLower());
                if (isMaCanBoExist)
                {
                    errors.Add("Mã cán bộ này đã tồn tại trong hệ thống.");
                    return (false, null, errors);
                }
            }

            if (!string.IsNullOrEmpty(model.Email))
            {
                var isEmailExist = await _userManager.Users.AnyAsync(x => x.Email.ToLower() == model.Email.ToLower());
                if (isEmailExist)
                {
                    errors.Add("Email này đã tồn tại trong hệ thống.");
                    return (false, null, errors);
                }
            }

            if (!string.IsNullOrEmpty(model.PhoneNumber))
            {
                var isPhoneExist = await _userManager.Users.AnyAsync(x => x.PhoneNumber == model.PhoneNumber);
                if (isPhoneExist)
                {
                    errors.Add("Số điện thoại này đã tồn tại trong hệ thống.");
                    return (false, null, errors);
                }
            }

            var entity = _mapper.Map<AspNetUsersRequest, AppUser>(model);
            entity.UserName = model.UserName;
            entity.Gender = int.TryParse(model.Gender, out int dd) ? dd : 1;
            entity.CreatedDate = DateTime.Now;
            entity.UpdatedDate = DateTime.Now;
            entity.IsDeleted = false;

            if (entity.DonViId == Guid.Empty)
            {
                entity.DonViId = null;
            }

            if (string.IsNullOrEmpty(entity.MaCanBo))
            {
                entity.MaCanBo = await GenerateMaCanBo();
            }

            var defaultPassword = !string.IsNullOrWhiteSpace(model.MatKhau) ? model.MatKhau : "Password@123";

            // Đồng bộ / Tạo tài khoản trên Identity Service trước
            try
            {
                var roleCodes = model.VaiTro != null && model.VaiTro.Any() ? model.VaiTro : new List<string> { "ROLE_KPI" };
                var identityReq = new Hinet.Service.Common.IdentityClient.BatchCreateUsersRequestDto
                {
                    DefaultPassword = defaultPassword,
                    Users = new List<Hinet.Service.Common.IdentityClient.BatchCreateUserItemDto>
                    {
                        new Hinet.Service.Common.IdentityClient.BatchCreateUserItemDto
                        {
                            UserName = model.UserName,
                            FullName = !string.IsNullOrWhiteSpace(model.Name) ? model.Name : model.UserName,
                            Email = model.Email,
                            PhoneNumber = model.PhoneNumber,
                            Password = defaultPassword,
                            Roles = roleCodes
                        }
                    }
                };

                var identityResult = await _identityServiceClient.BatchCreateUsersAsync(identityReq);
                if (identityResult?.Data != null && identityResult.Data.Any())
                {
                    var firstItem = identityResult.Data.FirstOrDefault();
                    if (firstItem != null && firstItem.UserId.HasValue)
                    {
                        entity.Id = firstItem.UserId.Value;
                    }
                }
            }
            catch (Exception ex)
            {
                // Identity Service offline or unreachable -> continue with generated GUID
            }

            var result = await _userManager.CreateAsync(entity, defaultPassword);

            if (result.Succeeded)
            {
                if (model.VaiTro != null && model.VaiTro.Any())
                {
                    var roles = _roleRepository.GetQueryable()
                        .Where(x => model.VaiTro.Contains(x.Code) && !x.IsDeleted)
                        .ToList();

                    foreach (var r in roles)
                    {
                        _userRoleRepository.Add(new UserRole
                        {
                            Id = Guid.NewGuid(),
                            UserId = entity.Id,
                            RoleId = r.Id,
                            DepartmentId = Guid.Empty,
                            CreatedDate = DateTime.Now,
                            UpdatedDate = DateTime.Now,
                            IsDeleted = false
                        });
                    }

                    if (roles.Any())
                    {
                        await _userRoleRepository.SaveAsync();
                    }
                }

                return (true, entity, errors);
            }

            errors.AddRange(result.Errors.Select(e => e.Description));
            return (false, null, errors);
        }

        public async Task<(bool IsSuccess, string Message, List<DropdownOption>? Data)> GetCanBoByDonViId(Guid donViId)
        {
            try
            {
                var result = await GetQueryable()
                    .AsNoTracking()
                    .Where(x => x.DonViId == donViId && !x.IsDeleted)
                    .OrderBy(x => x.Name)
                    .Select(x => new DropdownOption
                    {
                        Value = x.Id.ToString(),
                        Label = x.Name
                    })
                    .ToListAsync();

                return (true, "Lấy danh sách cán bộ thành công", result);
            }
            catch (Exception ex)
            {
                return (false, $"Có lỗi xảy ra khi lấy danh sách cán bộ: {ex.Message}", null);
            }
        }

        private async Task<string> GenerateMaCanBo()
        {
            var prefix = "CB";
            var lastUser = await GetQueryable()
                .Where(x => x.MaCanBo != null && x.MaCanBo.StartsWith(prefix))
                .OrderByDescending(x => x.MaCanBo)
                .FirstOrDefaultAsync();

            if (lastUser == null || string.IsNullOrEmpty(lastUser.MaCanBo))
            {
                return $"{prefix}0001";
            }

            var lastCode = lastUser.MaCanBo.Substring(prefix.Length);
            if (int.TryParse(lastCode, out int lastNumber))
            {
                return $"{prefix}{(lastNumber + 1).ToString("D4")}";
            }

            return $"{prefix}{Guid.NewGuid().ToString("N").Substring(0, 4).ToUpper()}";
        }

        /// <summary>
        /// Gán vai trò "CaNhan" cho tất cả các tài khoản chưa có vai trò nào trong hệ thống
        /// </summary>
        /// <returns>Số lượng tài khoản vừa được gán vai trò</returns>
        public async Task<int> SetDefaultRoleCaNhanForUsersWithoutRole()
        {
            var caNhanRole = await _roleRepository.GetQueryable().FirstOrDefaultAsync(x => x.Code == "CaNhan");
            if (caNhanRole == null)
            {
                throw new Exception("Không tìm thấy vai trò 'CaNhan' trong hệ thống");
            }

            // Lấy danh sách UserId đã có vai trò trong bảng UserRole
            var userIdsWithRole = await _userRoleRepository.GetQueryable()
                .Where(x => x.IsDeleted != true)
                .Select(x => x.UserId)
                .Distinct()
                .ToListAsync();

            // Lấy danh sách UserChuaCoRole từ bảng AppUser
            var usersWithoutRole = await GetQueryable()
                .Where(x => !userIdsWithRole.Contains(x.Id))
                .Select(x => x.Id)
                .ToListAsync();

            if (!usersWithoutRole.Any())
            {
                return 0;
            }

            var newUserRoles = usersWithoutRole.Select(userId => new UserRole
            {
                UserId = userId,
                RoleId = caNhanRole.Id
            }).ToList();

            _userRoleRepository.AddRange(newUserRoles);
            await _userRoleRepository.SaveAsync();
            return newUserRoles.Count;
        }

        public async Task<(int Total, int Success, List<string> Errors)> SyncAllUsersToIdentity()
        {
            var errors = new List<string>();
            try
            {
                var users = await GetQueryable().Where(x => !x.IsDeleted).ToListAsync();
                if (!users.Any()) return (0, 0, errors);

                var allUserRoles = await _userRoleRepository.GetQueryable()
                    .Where(x => !x.IsDeleted)
                    .Join(_roleRepository.GetQueryable().Where(r => !r.IsDeleted),
                        ur => ur.RoleId,
                        r => r.Id,
                        (ur, r) => new { ur.UserId, RoleCode = r.Code })
                    .ToListAsync();

                var requestDto = new Hinet.Service.Common.IdentityClient.BatchCreateUsersRequestDto
                {
                    DefaultPassword = "Password@123",
                    Users = users.Select(u =>
                    {
                        var roles = allUserRoles.Where(r => r.UserId == u.Id).Select(r => r.RoleCode).ToList();
                        if (!roles.Any()) roles.Add("ROLE_KPI");
                        if (!roles.Contains("ROLE_KPI")) roles.Add("ROLE_KPI");

                        return new Hinet.Service.Common.IdentityClient.BatchCreateUserItemDto
                        {
                            UserName = u.UserName,
                            FullName = !string.IsNullOrWhiteSpace(u.Name) ? u.Name : u.UserName,
                            Email = u.Email,
                            PhoneNumber = u.PhoneNumber,
                            Roles = roles
                        };
                    }).ToList()
                };

                var response = await _identityServiceClient.BatchCreateUsersAsync(requestDto);
                if (response != null && response.Status && response.Data != null)
                {
                    var successCount = response.Data.Count(x => x.Success);
                    return (users.Count, successCount, errors);
                }

                errors.Add(response?.Message ?? "Không thể kết nối Identity Service");
                return (users.Count, 0, errors);
            }
            catch (Exception ex)
            {
                errors.Add(ex.Message);
                return (0, 0, errors);
            }
        }
    }
}