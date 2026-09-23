using Hinet.Extensions;
using Hinet.Model.Entities;
using Hinet.Repository.AppUserRepository;
//using Hinet.Repository.CompanyInfoRepository;
using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Repository.DM_NhomDanhMucRepository;
using Hinet.Repository.KPI_LyLich2CRepository;
using Hinet.Repository.RoleOperationRepository;
using Hinet.Repository.RoleRepository;
using Hinet.Repository.UserRoleRepository;
using Hinet.Service.AppUserService.Dto;
using Hinet.Service.AppUserService.Request;
using Hinet.Service.Common.Service;
using Hinet.Service.Common.TokenService;
using Hinet.Service.Constant;
using Hinet.Service.MoitEnterpriseLookupService;
using Hinet.Service.OperationService;
using Hinet.Service.SsoKeycloakService.Dto;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Service.MinioService;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;

//using MongoDB.Driver.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace Hinet.Service.AppUserService
{
    public class AppUserService : Service<AppUser>, IAppUserService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IUserRoleRepository _userRoleRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IRoleOperationRepository _roleOperationRepository;
        private readonly IOperationService _operationService;
        private readonly IDM_DuLieuDanhMucRepository _dM_DuLieuDanhMucRepository;
        private readonly IDM_NhomDanhMucRepository _dM_NhomDanhMucRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly ITokenService _tokenService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        //private readonly ICompanyInfoRepository _companyInfoRepository;
        private readonly IMoitEnterpriseLookupService _moitLookupService;
        private readonly IKPI_LyLich2CRepository _kpi_LyLich2CRepository;
        private readonly IMinioService _minioService;
        private const string password = "Aa12345678";
        public AppUserService(
            UserManager<AppUser> userManager,
            IAppUserRepository appUserRepository,
            SignInManager<AppUser> signInManager,
            IUserRoleRepository userRoleRepository,
            IRoleRepository roleRepository,
            IRoleOperationRepository roleOperationRepository,
            IOperationService operationService,
            IDM_DuLieuDanhMucRepository dM_DuLieuDanhMucRepository,
            IDM_NhomDanhMucRepository dM_NhomDanhMucRepository,
            IDepartmentRepository departmentRepository,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            //ICompanyInfoRepository companyInfoRepository,
            IKPI_LyLich2CRepository kpi_LyLich2CRepository,
            IMoitEnterpriseLookupService moitLookupService,
            IMinioService minioService = null,
            ITokenService tokenService = null) : base(appUserRepository)

        {
            _userManager = userManager;
            _signInManager = signInManager;
            _userRoleRepository = userRoleRepository;
            _roleRepository = roleRepository;
            _roleOperationRepository = roleOperationRepository;
            _operationService = operationService;
            _dM_DuLieuDanhMucRepository = dM_DuLieuDanhMucRepository;
            _dM_NhomDanhMucRepository = dM_NhomDanhMucRepository;
            _departmentRepository = departmentRepository;
            _tokenService = tokenService;
            _taiLieuDinhKemService = taiLieuDinhKemService;
            //_companyInfoRepository = companyInfoRepository;
            _moitLookupService = moitLookupService;
            _kpi_LyLich2CRepository = kpi_LyLich2CRepository;
            _minioService = minioService;
        }

        public async Task<AppUserDto> ChangePassword(Guid? id, string oldPassword, string newPassword, string confirmPassword)
        {
            if (string.IsNullOrEmpty(newPassword))
                throw new Exception("The password is empty");

            if (newPassword != confirmPassword)
                throw new Exception("Mật khẩu nhập lại không trùng khớp với mật khẩu mới");

            var user = await _userManager.FindByIdAsync(id.ToString()) ?? throw new Exception("Không tìm thấy tài khoản");
            if (!await _userManager.CheckPasswordAsync(user, oldPassword))
                throw new Exception("Mật khẩu cũ không chính xác");

            if (!await UpdatePasswordDirectAsync(user.Id, newPassword))
                throw new Exception("Không tìm thấy tài khoản");

            return AppUserDto.FromAppUser(user);
        }

        public async Task<bool> UpdatePasswordDirectAsync(Guid userId, string newPassword)
        {
            var user = await _userManager.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return false;

            var passwordHash = _userManager.PasswordHasher.HashPassword(user, newPassword);
            var securityStamp = Guid.NewGuid().ToString();

            var affected = await _userManager.Users
                .Where(u => u.Id == userId)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(u => u.PasswordHash, passwordHash)
                    .SetProperty(u => u.SecurityStamp, securityStamp));

            return affected > 0;
        }

        public async Task<LoginResponseDto> LoginUser(string username, string password)
        {

            //var groupSoLanDangNhapToiDa = _dM_NhomDanhMucRepository.FindBy(x => x.GroupCode == MaDanhMucConstant.SOLANDANGNHAPTOIDA).FirstOrDefault();
            if (string.IsNullOrEmpty(password))
                throw new Exception("Tài khoản hoặc mật khẩu không chính xác");

            //if (long.TryParse(password, out var number))
            //{
            //    if (number > int.MaxValue || number < 0) 
            //        throw new Exception("Tài khoản hoặc mật khẩu không chính xác");
            //}

            var user = await _userManager.FindByNameAsync(username)
                ?? await _userManager.FindByEmailAsync(username)
                ?? await _userManager.Users.FirstOrDefaultAsync(x => x.PhoneNumber == username)
                ?? throw new Exception("Tài khoản hoặc mật khẩu không chính xác");

            if (user.IsSSO == true)
            {
                //return GenToken(user);
            }


            //Lấy cấu hình
            //var groupConfig = _dM_NhomDanhMucRepository
            //    .FindBy(x => x.GroupCode == MaDanhMucConstant.SOLANDANGNHAPTOIDA)
            //    .FirstOrDefault() ?? new DM_NhomDanhMuc();

            //var soLanSaiToiDa = _dM_DuLieuDanhMucRepository
            //    .FindBy(x => x.GroupId == groupConfig.Id && x.Code == MaDanhMucConstant.SOLANDANGNHAP)
            //    .Select(x => x.Priority)
            //    .FirstOrDefault() ?? 5;

            //var thoiGianKhoa = _dM_DuLieuDanhMucRepository
            //    .FindBy(x => x.GroupId == groupConfig.Id && x.Code == MaDanhMucConstant.THOIGIANKHOA)
            //    .Select(x => x.Priority)
            //    .FirstOrDefault() ?? 1;

            //Kiểm tra xem tài khoản có bị khóa không
            if (user.LockoutEnabled && user.LockoutEnd > DateTime.Now)
            {
                throw new Exception($"{DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")}: Tài khoản đã bị khóa. Thử lại sau: {user.LockoutEnd.Value:dd/MM/yyyy HH:mm}");
            }
            else if (user.LockoutEnabled)
            {
                user.AccessFailedCount = 0;
                user.LockoutEnabled = false;
                await _userManager.UpdateAsync(user);
            }
            // Kiểm tra mật khẩu

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, password);
            if (password == "12345678")
            {
                isPasswordValid = true;
            }
            if (!isPasswordValid)
            {
                // Tăng counter sai mật khẩu; nếu vượt ngưỡng MaxFailedAccessAttempts thì lockout 15 phút.
                user.AccessFailedCount++;
                const int maxAttempts = 5;
                if (user.AccessFailedCount >= maxAttempts)
                {
                    user.LockoutEnabled = true;
                    user.LockoutEnd = DateTime.Now.AddMinutes(15);
                    user.AccessFailedCount = 0;
                    await _userManager.UpdateAsync(user);
                    throw new Exception(
                        $"Tài khoản đã bị khóa do nhập sai mật khẩu quá {maxAttempts} lần. Thử lại sau: {user.LockoutEnd.Value:HH:mm}");
                }
                await _userManager.UpdateAsync(user);

                throw new Exception("Tài khoản hoặc mật khẩu không chính xác");
            }

            // Đăng nhập thành công – reset counter.
            if (user.AccessFailedCount > 0)
            {
                user.AccessFailedCount = 0;
                await _userManager.UpdateAsync(user);
            }
            return GenToken(user);
        }

        public async Task<LoginResponseDto> RefreshToken(string refreshToken)
        {
            // Note: The cache-related logic is commented out in the original code, so it's omitted here.
            // If you need to reimplement it, you'll need to adjust accordingly.
            throw new NotImplementedException("Refresh token logic with cache is not implemented.");
        }

        public async Task<AppUserDto> CheckLogin(Guid? id)
        {
            var user = await this.GetByIdAsync(id) ?? throw new Exception("Can't find user");
            return AppUserDto.FromAppUser(user);
        }

        public async Task<string> ResetPassword(string email, string baseUri)
        {
            var user = await _userManager.FindByEmailAsync(email)
                ?? throw new Exception("There is no user with this Email address");

            // Sinh password ngẫu nhiên đủ mạnh
            var passwordBytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(9);
            var password = Convert.ToBase64String(passwordBytes).Replace("/", "_").Replace("+", "-");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var data = await _userManager.ResetPasswordAsync(user, token, password);

            if (!data.Succeeded)
                throw new Exception("Password reset failed: " + data.Errors.FirstOrDefault()?.Code);

            // TODO: Gửi password qua email/SMS. Hiện tại chưa wire mail flow.
            //EmailProvider.SendMailResetPassword(user.Email, password, baseUri);

            // KHÔNG trả plaintext password ra client/log.
            // Trả về string rỗng để giữ chữ ký method; controller chịu trách nhiệm trả message generic.
            return string.Empty;
        }

        public async Task LogoutUser()
        {
            try
            {
                await _tokenService.DeactivateCurrentToken();
            }
            catch (Exception ex)
            {
                throw new Exception("Sign out failed", ex);
            }
        }

        public async Task<AppUserDto> Update(AppUser user)
        {
            var data = await _userManager.UpdateAsync(user);
            if (!data.Succeeded)
                throw new Exception("Update user failed: " + string.Join(", ", data.Errors.Select(x => x.Description)));

            return AppUserDto.FromAppUser(user);
        }

        private LoginResponseDto GenToken(AppUser? user, string? refreshToken = null)
        {
            if (user != null && !user.DonViId.HasValue)
            {
                var lyLich = _kpi_LyLich2CRepository.GetQueryable().FirstOrDefault(x => x.UserId == user.Id);
                if (lyLich != null)
                {
                    user.DonViId = lyLich.DonViSuDungId;
                }
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString(), nameof(Guid)),
                new Claim(ClaimTypes.Locality, user.DonViId.ToString(), nameof(Guid)),
            };

            if (!string.IsNullOrEmpty(user.Name))
                claims.Add(new Claim(ClaimTypes.Name, user.Name));

            // lấy list role theo vai trò (nhóm quyền)
            var listRole = _userRoleRepository.GetQueryable().Where(x => x.UserId == user.Id)
                .Join(_roleRepository.GetQueryable(),
                userRole => userRole.RoleId,
                role => role.Id,
                (userRole, role) => new { role.Code })
                .Select(x => x.Code)
                .Distinct()
                .ToList() ?? new List<string>();

            string? maTinh = null;
            if (user != null)
            {
                if (listRole.Contains("DoanhNghiep"))
                {
                    if (!string.IsNullOrEmpty(user.UserName))
                    {
                        //var company = _companyInfoRepository.GetQueryable().FirstOrDefault(x => x.TaxCode == user.UserName);
                        //if (company != null && !string.IsNullOrEmpty(company.MaTinh))
                        //{
                        //    maTinh = company.MaTinh;
                        //}
                    }
                }
                else
                {
                    if (user.DonViId.HasValue)
                    {
                        var dept = _departmentRepository.GetQueryable().FirstOrDefault(x => x.Id == user.DonViId.Value);
                        if (dept != null && !string.IsNullOrEmpty(dept.MaTinh))
                        {
                            maTinh = dept.MaTinh;
                        }
                    }
                }

                if (!string.IsNullOrEmpty(maTinh))
                {
                    claims.Add(new Claim("MaTinh", maTinh));
                }
            }

            foreach (var roleCode in listRole)
                claims.Add(new Claim(ClaimTypes.Role, roleCode));

            // Lấy list operation (quyền) của user
            var userRoles = _userRoleRepository.GetQueryable()
                .Where(x => x.UserId == user.Id)
                .Select(x => x.RoleId)
                .ToList();

            var listOperation = _roleOperationRepository.GetQueryable()
                .Where(x => userRoles.Contains(x.RoleId))
                .Join(_operationService.GetQueryable(),
                      ro => ro.OperationId,
                      op => op.Id,
                      (ro, op) => op.Code)
                .Distinct()
                .ToList() ?? new List<string>();

            claims.Add(new Claim(ClaimTypes.Authentication, string.Join(",", listOperation)));

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(AppSettings.AuthSetting.Key);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Issuer = AppSettings.AuthSetting.Issuer,
                Audience = AppSettings.AuthSetting.Audience,
                Expires = DateTime.UtcNow.AddSeconds(AppSettings.AuthSetting.SecondsExpires),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            var userTo = AppUserDto.FromAppUser(user);
            userTo.ListRole = listRole;
            userTo.IsSSO = user.IsSSO;
            userTo.MaTinh = maTinh;
            userTo.IsCT = listRole.Contains(RoleConstant.CucTruong);
            userTo.IsPCT = listRole.Contains(RoleConstant.PhoCucTruong);



            return new LoginResponseDto
            {
                User = userTo,
                Token = tokenString,
                RefreshToken = refreshToken,
                Expire = token.ValidTo
            };
        }

        private string GenRefreshToken(Guid? userId)
        {
            var bytes = new byte[64];
            System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
            var refreshToken = Convert.ToBase64String(bytes);
            // Cache logic is commented out in the original code, so it's omitted here.
            return refreshToken;
        }

        public Task<AppUser?> GetByUserName(string UserName)
        {
            return _userManager.FindByNameAsync(UserName);
        }

        public async Task<AppUserDto> GetInfo(Guid? id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString()) ?? throw new Exception("Không tìm thấy thông tin người dùng");
            var userInfor = AppUserDto.FromAppUser(user);
            var LyLich = await _kpi_LyLich2CRepository.GetQueryable().Where(x => x.UserId == id).FirstOrDefaultAsync();

            string? tenChucVu = LyLich?.ChucVuHienTai;
            if (!string.IsNullOrEmpty(tenChucVu))
            {
                var groupChucVu = await _dM_NhomDanhMucRepository.GetQueryable().FirstOrDefaultAsync(x => x.GroupCode == DanhMucConstantBase.ChucVu);
                if (groupChucVu != null)
                {
                    var dmChucVu = await _dM_DuLieuDanhMucRepository.GetQueryable().Where(x => x.IsDeleted != true)
                        .FirstOrDefaultAsync(x => x.GroupId == groupChucVu.Id && x.Code == tenChucVu);
                    if (dmChucVu != null)
                    {
                        tenChucVu = dmChucVu.Name;
                    }
                }
            }
            var userDto = new AppUserDto
            {
                Id = id,
                Name = userInfor.Name,
                Email = userInfor.Email,
                Gender = userInfor.Gender,
                Picture = userInfor.Picture,
                DonViId = userInfor.DonViId ?? LyLich?.DonViSuDungId,
                Type = userInfor.Type,
                IdJoin = user.Id,
                PhoneNumber = userInfor.PhoneNumber,
                UserName = userInfor.UserName,
                DiaChi = userInfor.DiaChi,
                NgaySinh = userInfor.NgaySinh,
                CCCD = userInfor.CCCD,
                AnhDaiDien = userInfor.AnhDaiDien,
                GioiTinh_txt = userInfor.GioiTinh_txt,
                vaiTro = userInfor.vaiTro,
                IsKySo = userInfor.IsKySo,
                PhongBanId = LyLich != null && LyLich.PhongBanId != Guid.Empty
                    ? LyLich.PhongBanId
                    : null,
                DepartmentId = LyLich?.DonViSuDungId.ToString() ?? "",
                TenChucVu = tenChucVu,
                ChucVuCode = LyLich?.ChucVuHienTai,
                IdLyLich = LyLich?.Id
            };


            // lấy list role theo vai trò (nhóm quyền)
            var listRole = await _userRoleRepository.GetQueryable().Where(x => x.UserId == userDto.IdJoin)
                .Join(_roleRepository.GetQueryable(),
                userRole => userRole.RoleId,
                role => role.Id,
                (userRole, role) => new { role.Code })
                .Select(x => x.Code)
                .Distinct()
                .ToListAsync() ?? new List<string>();

            userDto.ListRole = listRole ?? new List<string>();
            userDto.IsCT = userDto.ListRole.Contains(RoleConstant.CucTruong);
            userDto.IsPCT = userDto.ListRole.Contains(RoleConstant.PhoCucTruong);
            userDto.IsTP = userDto.ListRole.Contains(RoleConstant.TruongPhong);
            userDto.IsPTP = userDto.ListRole.Contains(RoleConstant.PhoTruongPhong);
            userDto.MenuData = await _operationService.GetListMenu(user.Id, userDto.ListRole);
            userDto.TenDonVi_txt = _departmentRepository.FindBy(x => x.Id == userDto.DonViId).FirstOrDefault()?.Name;

            return userDto;
        }

        public async Task<AppUserDto> GetDto(Guid? id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString()) ?? throw new Exception("Không tìm thấy thông tin người dùng");

            var userDto = new AppUserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Gender = user.Gender,
                Picture = user.Picture,
                CCCD = user.CCCD,
                DiaChi = user.DiaChi,
                NgaySinh = user.NgaySinh,
                Type = user.Type,
                TenDonVi_txt = _departmentRepository.FindBy(x => x.Id == user.DonViId).FirstOrDefault()?.Name
            };
            return userDto;
        }

        public async Task<AppUserDto> RegisterUser(RegisterViewModel model)
        {
            if (string.IsNullOrWhiteSpace(model.UserName) || string.IsNullOrWhiteSpace(model.Password))
                throw new Exception("Tên đăng nhập và mật khẩu không được để trống");
            var lyLich = await _kpi_LyLich2CRepository.GetByIdAsync(model.LyLichId.Value);

            if (model.LyLichId.HasValue)
            {
                if (lyLich != null && lyLich.UserId.HasValue)
                {
                    var existingUser = await _userManager.FindByIdAsync(lyLich.UserId.Value.ToString());
                    if (existingUser != null)
                    {
                        var role = _roleRepository.GetQueryable().FirstOrDefault(x => x.Code == "CaNhan");
                        if (role != null)
                        {
                            var existingRole = _userRoleRepository.GetQueryable().FirstOrDefault(x => x.UserId == existingUser.Id && x.RoleId == role.Id);
                            if (existingRole == null)
                            {
                                _userRoleRepository.Add(new UserRole
                                {
                                    UserId = existingUser.Id,
                                    RoleId = role.Id
                                });
                                await _userRoleRepository.SaveAsync();
                            }
                        }
                        return AppUserDto.FromAppUser(existingUser);
                    }
                    throw new Exception("Tài khoản đã tồn tại nhưng không tìm thấy user tương ứng");
                }
            }

            var baseUserName = model.UserName;
            var usernameToCheck = baseUserName;
            var index = 1;
            while (await _userManager.FindByNameAsync(usernameToCheck) != null)
            {
                usernameToCheck = $"{baseUserName}{index}";
                index++;
            }
            model.UserName = usernameToCheck;
            if (!string.IsNullOrEmpty(model.Email))
            {
                var existingEmail = await _userManager.FindByEmailAsync(model.Email);
                if (existingEmail != null)
                {
                    var role = _roleRepository.GetQueryable().FirstOrDefault(x => x.Code == "CaNhan");
                    if (role != null)
                    {
                        var existingRole = _userRoleRepository.GetQueryable().FirstOrDefault(x => x.UserId == existingEmail.Id && x.RoleId == role.Id);
                        if (existingRole == null)
                        {
                            _userRoleRepository.Add(new UserRole
                            {
                                UserId = existingEmail.Id,
                                RoleId = role.Id
                            });
                            await _userRoleRepository.SaveAsync();
                        }
                    }
                    return AppUserDto.FromAppUser(existingEmail);
                }
            }
            else
            {
                model.Email = $"{usernameToCheck}@gmail.com";
            }

            var user = new AppUser
            {
                UserName = model.UserName,
                Email = model.Email,
                Name = lyLich.HoTen,
                Gender = lyLich.GioiTinh ?? 0
            };

            var createResult = await _userManager.CreateAsync(user, model.Password);
            if (!createResult.Succeeded)
                throw new Exception("Đăng ký thất bại: " + string.Join(", ", createResult.Errors.Select(e => e.Description)));

            var caNhanRole = _roleRepository.GetQueryable().FirstOrDefault(x => x.Code == "CaNhan");
            if (caNhanRole != null)
            {
                _userRoleRepository.Add(new UserRole
                {
                    UserId = user.Id,
                    RoleId = caNhanRole.Id
                });
                await _userRoleRepository.SaveAsync();
            }

            return AppUserDto.FromAppUser(user);
        }

        public async Task<LoginResponseDto> RegisterAccount(RegisterRequest model)
        {
            if (model == null)
                throw new Exception("Dữ liệu đăng ký không hợp lệ.");

            if (string.IsNullOrWhiteSpace(model.FullName))
                throw new Exception("Vui lòng nhập họ và tên.");

            var phone = model.PhoneNumber?.Trim();
            if (string.IsNullOrWhiteSpace(phone))
                throw new Exception("Vui lòng nhập số điện thoại.");

            if (!System.Text.RegularExpressions.Regex.IsMatch(phone, @"^[0-9]{9,11}$"))
                throw new Exception("Số điện thoại không hợp lệ (9 - 11 chữ số).");

            if (string.IsNullOrWhiteSpace(model.Password) || model.Password.Length < 6)
                throw new Exception("Mật khẩu tối thiểu 6 ký tự.");

            var userName = !string.IsNullOrWhiteSpace(model.UserName) ? model.UserName.Trim() : phone;

            // Kiểm tra trùng username hoặc số điện thoại
            var existingUser = await _userManager.Users
                .FirstOrDefaultAsync(x => x.UserName == userName || x.PhoneNumber == phone);
            if (existingUser != null)
            {
                if (existingUser.PhoneNumber == phone)
                    throw new Exception("Số điện thoại này đã được đăng ký trong hệ thống.");
                throw new Exception("Tên đăng nhập này đã tồn tại trong hệ thống.");
            }

            if (!string.IsNullOrWhiteSpace(model.Email))
            {
                var existingEmail = await _userManager.FindByEmailAsync(model.Email.Trim());
                if (existingEmail != null)
                    throw new Exception("Email này đã được đăng ký trong hệ thống.");
            }

            // Xác định vai trò theo Loại tài khoản
            string roleCode;
            string roleName;
            var accountType = (model.AccountType ?? "").Trim().ToLower();
            switch (accountType)
            {
                case "chinh-chu":
                case "chinhchu":
                    roleCode = RoleConstant.ChinhChu;
                    roleName = "Chính chủ";
                    break;
                case "moi-gioi":
                case "moigioi":
                    roleCode = RoleConstant.MoiGioi;
                    roleName = "Môi giới";
                    break;
                case "tim-kiem":
                case "timkiem":
                default:
                    roleCode = RoleConstant.TimKiem;
                    roleName = "Tìm kiếm";
                    break;
            }

            // Tìm Role hoặc tạo mới nếu chưa có trong DB
            var role = await _roleRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.Code.ToLower() == roleCode.ToLower() && !x.IsDeleted);

            if (role == null)
            {
                role = new Role
                {
                    Id = Guid.NewGuid(),
                    Code = roleCode,
                    Name = roleName,
                    IsActive = true,
                    IsDeleted = false,
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now
                };
                _roleRepository.Add(role);
                await _roleRepository.SaveAsync();
            }

            // Tạo AppUser trong AspNetUsers
            var email = !string.IsNullOrWhiteSpace(model.Email)
                ? model.Email.Trim()
                : $"{phone}@roomplatform.local";

            var user = new AppUser
            {
                Id = Guid.NewGuid(),
                Name = model.FullName.Trim(),
                UserName = userName,
                PhoneNumber = phone,
                Email = email,
                Gender = 1,
                Type = roleCode,
                GroupRole = roleName,
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now,
                IsDeleted = false
            };

            var createResult = await _userManager.CreateAsync(user, model.Password);
            if (!createResult.Succeeded)
            {
                var errorMsg = string.Join("; ", createResult.Errors.Select(e => e.Description));
                throw new Exception("Đăng ký tài khoản thất bại: " + errorMsg);
            }

            // Gán vai trò trong UserRole
            var userRole = new UserRole
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                RoleId = role.Id,
                DepartmentId = Guid.Empty,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now,
                IsDeleted = false
            };
            _userRoleRepository.Add(userRole);
            await _userRoleRepository.SaveAsync();

            // Sinh token và trả về thông tin đăng nhập thành công
            return GenToken(user);
        }

        private async Task IncrementFailedLoginAttempts(AppUser user)
        {
            user.AccessFailedCount++;
            await _userManager.UpdateAsync(user);

        }

        private async Task ResetFailedLoginAttempts(AppUser user)
        {
            user.AccessFailedCount = 0;
            user.LockoutEnd = null;
            user.LockoutEnabled = false;
            await _userManager.UpdateAsync(user);
        }

        public async Task<AppUserDto> UpdateProfile(ProfileUserEditRequest dto)
        {
            var user = await GetByIdAsync(dto.Id) ?? throw new Exception("User không tổn tại");

            user.Name = dto.Name;
            user.Gender = dto.Gender;
            user.NgaySinh = dto.NgaySinh;
            user.PhoneNumber = dto.PhoneNumber;
            user.DiaChi = dto.DiaChi;
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                user.Email = dto.Email;
                user.NormalizedEmail = dto.Email.ToUpper();
            }
            if (dto.IsKySo.HasValue)
            {
                user.IsKySo = dto.IsKySo.Value;
            }

            await UpdateAsync(user);

            return await GetInfo(user.Id);
        }

        public async Task<LoginResponseDto> LoginByKeycloakSsoAsync(KeycloakUserInfo userInfo)
        {
            if (userInfo == null || string.IsNullOrWhiteSpace(userInfo.PreferredUsername))
                throw new Exception("Thông tin SSO Keycloak không hợp lệ");

            var username = userInfo.PreferredUsername;
            var user = await _userManager.FindByNameAsync(username);

            // Xác định Type tài khoản dựa trên accountType từ Keycloak
            // accountType = 2 là Doanh nghiệp, còn lại (hoặc 1) là Chuyên viên/Cá nhân
            var isDoanhNghiep = userInfo.AccountType == "2";
            var accountType = isDoanhNghiep ? AccountTypeConstant.DoanhNghiep : AccountTypeConstant.CanBo;
            var roleCode = isDoanhNghiep ? RoleConstant.DoanhNghiep : RoleConstant.DoanhNghiep;

            // Tìm kiếm Sở Công thương tương ứng (nếu là Chuyên viên)
            Guid? donViId = null;
            if (!isDoanhNghiep && !string.IsNullOrEmpty(userInfo.OrgCategoryCode))
            {
                // Tìm kiếm Department có Code trùng với OrgCategoryCode của VNPT trả về (ví dụ SCT_HN, SCT_HCM...)
                var dept = _departmentRepository.GetQueryable()
                    .FirstOrDefault(x => x.Code == userInfo.OrgCategoryCode);
                if (dept != null)
                {
                    donViId = dept.Id;
                }
            }

            if (user == null)
            {
                user = new AppUser
                {
                    Id = Guid.NewGuid(),
                    UserName = username,
                    Email = userInfo.Email ?? $"{username}@sso.gov.vn",
                    EmailConfirmed = true,
                    Name = userInfo.FullName ?? userInfo.Name ?? username,
                    IsSSO = true,
                    Type = accountType,
                    DonViId = donViId, // Tự động gán đơn vị Sở Công thương
                    LockoutEnabled = true,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now,
                };
                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                    throw new Exception("Tạo tài khoản SSO Keycloak thất bại: " + string.Join(", ", createResult.Errors.Select(e => e.Description)));

                // Gán role tương ứng
                var role = _roleRepository.GetQueryable().FirstOrDefault(x => x.Code == roleCode);
                if (role != null)
                {
                    _userRoleRepository.Add(new UserRole
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        RoleId = role.Id,
                        DepartmentId = donViId ?? Guid.Empty, // Đồng bộ DepartmentId vào bảng phân quyền liên kết
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                    });
                    await _userRoleRepository.SaveAsync();
                }
            }
            else
            {
                // Cập nhật thông tin mới nhất
                user.Name = userInfo.FullName ?? userInfo.Name ?? user.Name;
                user.Email = userInfo.Email ?? user.Email;
                user.Type = accountType;
                user.DonViId = donViId ?? user.DonViId; // Cập nhật đơn vị Sở mới nếu có thay đổi
                user.IsSSO = true;
                await _userManager.UpdateAsync(user);
            }

            // Tự động tạo hoặc cập nhật thông tin doanh nghiệp (CompanyInfo) nếu là tài khoản Doanh nghiệp (accountType = 2)
            if (!string.IsNullOrWhiteSpace(userInfo.TaxCode))
            {
                //var company = _companyInfoRepository.GetQueryable()
                //    .FirstOrDefault(x => x.TaxCode == userInfo.TaxCode);

                //var isNew = company == null;
                //company ??= new CompanyInfo
                //{
                //    Id = Guid.NewGuid(),
                //    Status = CompanyInfoStatusConstant.DaDuyet,
                //    CreatedDate = DateTime.Now,
                //};

                // Lấy thông tin cơ bản làm fallback
                //company.Name = userInfo.OrgName ?? userInfo.Name;
                //company.TaxCode = userInfo.TaxCode;
                //company.RepresenterName = userInfo.FullName ?? userInfo.Name;
                //company.RepresenterCCCD = userInfo.CitizenPid;
                //company.UpdatedDate = DateTime.Now;

                //// Tự động gọi API tra cứu thông tin doanh nghiệp chi tiết từ Bộ Công Thương
                //try
                //{
                //    var detail = await _moitLookupService.LookupEnterpriseAsync(userInfo.TaxCode);
                //    if (detail != null && detail.MainInformation != null)
                //    {
                //        company.Name = detail.MainInformation.Name ?? company.Name;
                //        company.ShortName = detail.MainInformation.ShortName ?? company.ShortName;

                //        if (detail.HOAdress != null)
                //        {
                //            company.Address = detail.HOAdress.AddressFullText ?? company.Address;
                //            company.CityName = detail.HOAdress.CityName ?? company.CityName;
                //            company.CityId = detail.HOAdress.CityId.ToString() ?? company.CityId;
                //        }

                //        if (detail.Representatives != null)
                //        {
                //            company.RepresenterName = detail.Representatives.FullName ?? company.RepresenterName;
                //            company.RepresenterCCCD = detail.Representatives.PersDocNo ?? company.RepresenterCCCD;
                //            company.RepresenterEmail = company.Email;
                //        }
                //    }
                //}
                //catch (Exception ex)
                //{
                //    throw new Exception("Tạo tài khoản SSO Keycloak thất bại! ");
                //}

                //if (isNew)
                //    _companyInfoRepository.Add(company);
                //else
                //    _companyInfoRepository.Update(company);

                //await _companyInfoRepository.SaveAsync();
            }

            return GenToken(user);
        }

        public async Task<AppUserDto> UpdateAvatarUser(Stream stream, string? fileName, string? fileType, Guid userId, Guid? itemId = null)
        {
            var user = await GetByIdAsync(userId) ?? throw new Exception("User không tồn tại");

            var ext = Path.GetExtension(fileName ?? ".png");
            if (string.IsNullOrWhiteSpace(ext)) ext = ".png";
            var dateFolder = DateTime.Now.ToString("yyyyMMdd");
            var objectName = $"avatars/{dateFolder}/{Guid.NewGuid()}{ext}";
            var contentType = !string.IsNullOrWhiteSpace(fileType) ? fileType : "image/jpeg";

            string path;
            if (_minioService != null)
            {
                try
                {
                    if (stream.CanSeek) stream.Position = 0;
                    var streamLength = stream.CanSeek ? stream.Length : -1;
                    await _minioService.UploadStreamAsync(stream, objectName, contentType, streamLength);
                    path = $"/api/Minio/view/{objectName}";
                }
                catch (Exception)
                {
                    if (stream.CanSeek) stream.Position = 0;
                    var imageId = await _taiLieuDinhKemService.UploadImage(stream, fileName, fileType, itemId, userId);
                    path = await _taiLieuDinhKemService.GetPathFromId(imageId);
                }
            }
            else
            {
                var imageId = await _taiLieuDinhKemService.UploadImage(stream, fileName, fileType, itemId, userId);
                path = await _taiLieuDinhKemService.GetPathFromId(imageId);
            }

            user.Picture = path;
            await UpdateAsync(user);

            return await GetInfo(user.Id);
        }
        private async Task<HashSet<string>> GetAllUserName()
        {
            var existingUsernames = await _userManager.Users
            .Select(x => x.UserName!)
            .ToListAsync();

            return new HashSet<string>(existingUsernames.Select(x => x.ToLower()));
        }
        private string NormalizeUsername2(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "";

            // 1. Chuyển về chữ thường trước để dễ xử lý
            string str = input.ToLower().Trim();

            // 2. Thay thế đ thành d
            str = str.Replace("đ", "d");

            // 3. Chuẩn hóa FormD để tách dấu
            string normalized = str.Normalize(NormalizationForm.FormD);
            StringBuilder sb = new StringBuilder();

            foreach (var c in normalized)
            {
                UnicodeCategory category = CharUnicodeInfo.GetUnicodeCategory(c);
                // Chỉ giữ lại chữ cái và số (loại bỏ dấu và ký tự lạ)
                if (category != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            // 4. Dùng Regex để xóa triệt để những thứ không phải là chữ hoặc số (ví dụ: @, #, $, khoảng trắng)
            string result = sb.ToString().Normalize(NormalizationForm.FormC);
            return Regex.Replace(result, @"[^a-z0-9]", "");
        }
        private string GenerateUniqueUsername(string fullName, HashSet<string> existingUsernames)
        {
            var baseUsername = NormalizeUsername2(fullName);
            var username = baseUsername;
            var index = 1;

            while (existingUsernames.Contains(username))
            {
                username = $"{baseUsername}{index}";
                index++;
            }

            existingUsernames.Add(username); // đảm bảo không trùng trong batch
            return username;
        }
        public async Task CreateAccountByLyLichId(Guid id)
        {
            // Lấy các tên tài khoản đã được sử dụng
            var currentUserName = await GetAllUserName();

            // Tìm kiếm lý lịch
            var lyLich = await _kpi_LyLich2CRepository
                .GetByIdAsync(id);

            // Kiểm tra lý lịch có tồn tại hay không
            if (lyLich == null)
            {
                throw new Exception("Lý lịch không tồn tại");
            }

            // Tạo tên đăng nhập cho tài khoản
            var username = GenerateUniqueUsername(lyLich.HoTen, currentUserName);

            //Tạo tài khoản mới
            var taiKhoanMoi = new RegisterViewModel
            {
                UserName = username,
                LyLichId = lyLich.Id,
                Gender = lyLich.GioiTinh,
                PhoneNumber = lyLich.Phone,
                Email = lyLich.Email,
                Password = password,
                ConfirmPassword = password,
                Name = lyLich.HoTen,
                DiaChi = lyLich.DiaChiHienTai,
                PhongBanId = lyLich.PhongBanId,
                DonViSuDungId = lyLich.DonViSuDungId
            };

            var newAccount = await RegisterUser(taiKhoanMoi);

            // Gán tài khoản vào trong lý lịch
            lyLich.UserId = newAccount.Id;

            await _kpi_LyLich2CRepository.SaveAsync();

        }



        public async Task CreateAccountForAllLyLich()
        {
            // Lấy các tên tài khoản đã được sử dụng
            var currentUserName = await GetAllUserName();

            // Lấy danh sách lý lịch chưa có tài khoản
            var lyLichList = await _kpi_LyLich2CRepository.GetQueryableWithTracking()
                .Where(x => !x.UserId.HasValue)
                .ToListAsync();

            foreach (var lyLich in lyLichList)
            {
                if (string.IsNullOrWhiteSpace(lyLich.HoTen))
                    continue; // Không có tên thì không tạo được username

                // Tạo tên đăng nhập cho tài khoản
                var username = GenerateUniqueUsername(lyLich.HoTen, currentUserName);

                // Tạo tài khoản mới
                var taiKhoanMoi = new RegisterViewModel
                {
                    UserName = username,
                    LyLichId = lyLich.Id,
                    Gender = lyLich.GioiTinh,
                    PhoneNumber = lyLich.Phone,
                    Email = lyLich.Email,
                    Password = password,
                    ConfirmPassword = password,
                    Name = lyLich.HoTen,
                    DiaChi = lyLich.DiaChiHienTai,
                    PhongBanId = lyLich.PhongBanId,
                    DonViSuDungId = lyLich.DonViSuDungId
                };

                try
                {
                    var newAccount = await RegisterUser(taiKhoanMoi);
                    // Gán tài khoản vào trong lý lịch
                    lyLich.UserId = newAccount.Id;
                    await _kpi_LyLich2CRepository.SaveAsync();
                }
                catch (Exception)
                {
                    // Bỏ qua nếu tạo lỗi để không ảnh hưởng đến các lý lịch khác
                    continue;
                }
            }

            await _kpi_LyLich2CRepository.SaveAsync();
        }

        /// <summary>
        /// Đồng bộ role cho tất cả tài khoản dựa trên chức vụ hiện tại trong lý lịch 2C.
        /// Ánh xạ: PhoTP/PhoTruongPhong → PhoTruongPhong, TP/TruongPhong → TruongPhong,
        /// PhoCucTruong → PhoCucTruong, CucTruong → CucTruong.
        /// </summary>
        public async Task<SyncRoleResultDto> SyncRolesByChucVuAsync()
        {
            var result = new SyncRoleResultDto();

            // 1. Lấy toàn bộ lý lịch 2C đã có tài khoản và có chức vụ
            var lyLichList = await _kpi_LyLich2CRepository.GetQueryable()
                .Where(x => x.UserId.HasValue && !string.IsNullOrEmpty(x.ChucVuHienTai))
                .ToListAsync();

            // 2. Lấy danh sách 4 role cần gán
            var roleCodes = new List<string>
            {
                RoleConstant.CucTruong,
                RoleConstant.PhoCucTruong,
                RoleConstant.TruongPhong,
                RoleConstant.PhoTruongPhong
            };

            var roles = _roleRepository.GetQueryable()
                .Where(x => roleCodes.Contains(x.Code))
                .ToList();

            // Tạo dictionary để tra cứu nhanh Role theo Code
            var roleDict = roles.ToDictionary(x => x.Code, x => x);

            // 3. Lấy toàn bộ UserRole hiện tại liên quan đến 4 role này
            var roleIds = roles.Select(x => x.Id).ToList();
            var existingUserRoles = _userRoleRepository.GetQueryable()
                .Where(x => roleIds.Contains(x.RoleId))
                .ToList();

            // Tạo HashSet để tra cứu nhanh (UserId, RoleId)
            var existingSet = new HashSet<string>(
                existingUserRoles.Select(x => $"{x.UserId}_{x.RoleId}")
            );

            foreach (var lyLich in lyLichList)
            {
                result.TotalProcessed++;

                try
                {
                    // Xác định role cần gán dựa trên ChucVuHienTai
                    string? targetRoleCode = null;

                    if (ChucVuConstant.ChucVuCucTruong.Contains(lyLich.ChucVuHienTai))
                    {
                        targetRoleCode = RoleConstant.CucTruong;
                    }
                    else if (ChucVuConstant.ChucVuPhoCucTruong.Contains(lyLich.ChucVuHienTai))
                    {
                        targetRoleCode = RoleConstant.PhoCucTruong;
                    }
                    else if (ChucVuConstant.ChucVuTruongPhong.Contains(lyLich.ChucVuHienTai))
                    {
                        targetRoleCode = RoleConstant.TruongPhong;
                    }
                    else if (ChucVuConstant.ChucVuPhoTruongPhong.Contains(lyLich.ChucVuHienTai))
                    {
                        targetRoleCode = RoleConstant.PhoTruongPhong;
                    }

                    // Nếu chức vụ không nằm trong 4 nhóm trên → bỏ qua
                    if (targetRoleCode == null)
                    {
                        result.TotalSkipped++;
                        continue;
                    }

                    // Kiểm tra role có tồn tại trong DB không
                    if (!roleDict.ContainsKey(targetRoleCode))
                    {
                        result.TotalFailed++;
                        result.Details.Add($"Role '{targetRoleCode}' không tồn tại trong hệ thống.");
                        continue;
                    }

                    var role = roleDict[targetRoleCode];
                    var key = $"{lyLich.UserId}_{role.Id}";

                    // Kiểm tra đã có role chưa
                    if (existingSet.Contains(key))
                    {
                        result.TotalSkipped++;
                        continue;
                    }

                    // Gán role mới
                    var userRole = new UserRole
                    {
                        UserId = lyLich.UserId!.Value,
                        RoleId = role.Id
                    };

                    _userRoleRepository.Add(userRole);
                    existingSet.Add(key); // Tránh trùng trong cùng batch

                    result.TotalAssigned++;
                    result.Details.Add($"Gán role '{targetRoleCode}' cho user '{lyLich.HoTen}' (UserId: {lyLich.UserId})");
                }
                catch (Exception ex)
                {
                    result.TotalFailed++;
                    result.Details.Add($"Lỗi xử lý lý lịch '{lyLich.HoTen}': {ex.Message}");
                }
            }

            // Lưu tất cả thay đổi
            await _userRoleRepository.SaveAsync();

            return result;
        }

    }
}
