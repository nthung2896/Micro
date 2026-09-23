using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.ModuleService;
using Hinet.Service.ModuleService.Dto;
using Hinet.Service.ModuleService.Request;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Hinet.Api.Filter;
using Hinet.Api.Dto;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    public class ModuleController : HinetController
    {
        private readonly IModuleService _moduleService;
        private readonly IMapper _mapper;
        private readonly ILogger<ModuleController> _logger;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly Hinet.Service.TaiLieuDinhKemService.ITaiLieuDinhKemService _taiLieuDinhKemService;

        public ModuleController(
            IModuleService moduleService,
            IMapper mapper,
            ILogger<ModuleController> logger,
            IWebHostEnvironment webHostEnvironment,
            Hinet.Service.TaiLieuDinhKemService.ITaiLieuDinhKemService taiLieuDinhKemService)
        {
            this._moduleService = moduleService;
            this._mapper = mapper;
            _logger = logger;
            _webHostEnvironment = webHostEnvironment;
            _taiLieuDinhKemService = taiLieuDinhKemService;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<Module>> Create([FromBody] ModuleRequest model)
        {
            try
            {
                var entity = _mapper.Map<ModuleRequest, Module>(model);
                entity.Order = model.Order ?? 0;

                await _moduleService.CreateAsync(entity);

                if (model.FileId.HasValue)
                {
                    var tailieu = await _taiLieuDinhKemService.UpdateItemIdAsync(entity.Id, model.FileId.Value);
                    if (tailieu != null)
                    {
                        entity.Icon = tailieu.DuongDanFile;
                        await _moduleService.UpdateAsync(entity);
                    }
                }

                return new DataResponse<Module>() { Data = entity, Status = true };
            }
            catch (Exception ex)
            {
                return DataResponse<Module>.False("Error", new string[] { ex.Message });
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<Module>> Update([FromBody] ModuleRequest model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var entity = await _moduleService.GetByIdAsync(model.Id);
                    if (entity == null)
                        return DataResponse<Module>.False("Module not found");
                    
                    var existingIcon = entity.Icon;
                    entity = _mapper.Map(model, entity);
                    entity.Order = model.Order ?? 0;
                    
                    if (model.FileId.HasValue)
                    {
                        var tailieu = await _taiLieuDinhKemService.UpdateItemIdAsync(entity.Id, model.FileId.Value);
                        if (tailieu != null)
                        {
                            entity.Icon = tailieu.DuongDanFile;
                        }
                    }
                    else
                    {
                        entity.Icon = existingIcon;
                    }

                    await _moduleService.UpdateAsync(entity);

                    return new DataResponse<Module>() { Data = entity, Status = true };
                }
                catch (Exception ex)
                {
                    DataResponse<Module>.False(ex.Message);
                }
            }
            return DataResponse<Module>.False("Some properties are not valid", ModelStateError);
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<ModuleDto>> Get(Guid id)
        {
            var result = await _moduleService.GetDto(id);
            return new DataResponse<ModuleDto>
            {
                Data = result,
                Message = "Get chi tiết thành công",
                Status = true
            };
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<ModuleDto>>> GetData([FromBody] ModuleSearch search)
        {
            var listData = await _moduleService.GetData(search);

            if (listData != null)
            {
                foreach (var item in listData.Items)
                {
                    item.DuongDanIcon = item.Icon;
                }
            }
            return new DataResponse<PagedList<ModuleDto>>
            {
                Data = listData,
                Message = "GetData PagedList<ModuleDto> thành công",
                Status = true
            };
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _moduleService.GetByIdAsync(id);
                await _moduleService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                return DataResponse.False(ex.Message);
            }
        }

        [HttpPost("GetDropModule")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropModule(string? selected)
        {
            var result = await _moduleService.GetDropDown(selected);
            return new DataResponse<List<DropdownOption>>
            {
                Data = result,
                Message = "GetDropModule List<DropdownOption> thành công",
                Status = true
            };
        }

        [HttpGet("GetModuleGroupData")]
        public async Task<DataResponse<List<ModuleGroup>>> GetModuleGroupData(Guid roleId)
        {
            var result = await _moduleService.GetModuleGroupData(roleId);
            return new DataResponse<List<ModuleGroup>>
            {
                Data = result,
                Message = "Lấy dữ liệu thành công",
                Status = true
            };
        }
    }
}