using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.ApiPermissionsService;
using Hinet.Service.ApiPermissionsService.Dto;
using Hinet.Service.ApiPermissionsService.Request;
using Hinet.Service.Common;
using Hinet.Api.Filter;
using CommonHelper.Excel;
using CommonHelper.Extenions;
using Hinet.Web.Common;
using Hinet.Api.Request.Import;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Api.Dto;
using Hinet.Service.Dto;
using Hinet.Service.Constant;
using System.Reflection;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ApiPermissionsController : HinetController
    {
        private readonly IApiPermissionsService _apiPermissionsService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<ApiPermissionsController> _logger;

        public ApiPermissionsController(
            IApiPermissionsService apiPermissionsService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<ApiPermissionsController> logger
            )
        {
            this._apiPermissionsService = apiPermissionsService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Save")]
        public async Task<DataResponse> Save([FromBody] ApiPermissionsSaveVM model)
        {
            try
            {
                await _apiPermissionsService.Save(model);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo ApiPermissions");
                return DataResponse.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpGet("Get/{id}")]
        public async Task<DataResponse<ApiPermissionsDto>> Get(Guid id)
        {
            var dto = await _apiPermissionsService.GetDto(id);
            return DataResponse<ApiPermissionsDto>.Success(dto);
        }

        [HttpGet("GetByRoleId/{roleId}")]
        public async Task<DataResponse<List<ApiPermissionGroupData>>> GetByRoleId(Guid roleId)
        {
            var items = await _apiPermissionsService.GetByRoleId(roleId);
            var allChecked = items.Any(i => i.Path == "/api");
            var controllers = Assembly.GetExecutingAssembly().GetTypes()
                .Where(t => t.IsClass && !t.IsAbstract && t.Namespace == "Hinet.Controllers" && t.Name.EndsWith("Controller"))
                .Select(t =>
                {
                    var name = t.Name.Replace("Controller", "").ToLower();
                    var groupChecked = allChecked || items.Any(i => i.Path == $"/api/{name}");
                    return new ApiPermissionGroupData
                    {
                        Name = t.Name,
                        Path = $"/api/{name}",
                        Checked = groupChecked,
                        Actions = t.GetMethods(BindingFlags.Instance | BindingFlags.Public)
                                .Where(m => m.GetCustomAttributes(typeof(HttpGetAttribute), false).Any()
                                            || m.GetCustomAttributes(typeof(HttpPostAttribute), false).Any()
                                            || m.GetCustomAttributes(typeof(HttpPutAttribute), false).Any()
                                            || m.GetCustomAttributes(typeof(HttpDeleteAttribute), false).Any())
                        .Select(m =>
                        {
                            var name = $"{t.Name.Replace("Controller", "")}/{m.Name}".ToLower();
                            var actionChecked = groupChecked || items.Any(i => i.Path == $"/api/{name}".ToLower());
                            return new ApiPermissionAction
                            {
                                Name = m.Name,
                                Path = $"/api/{name}",
                                Checked = actionChecked
                            };
                        }).ToList()
                    };
                }).ToList();

            return DataResponse<List<ApiPermissionGroupData>>.Success(controllers);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _apiPermissionsService.GetByIdAsync(id);
                await _apiPermissionsService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa ApiPermissions với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
            }
        }

        [HttpGet("GetDropdowns")]
        public async Task<DataResponse<Dictionary<string, List<DropdownOption>>>> GetDropdowns([FromQuery] string[] types)
        {
            var result = new Dictionary<string, List<DropdownOption>>()
            {
            };

            return DataResponse<Dictionary<string, List<DropdownOption>>>.Success(result);
        }


    }
}