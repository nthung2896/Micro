using CommonHelper.Excel;
using Hinet.Api.Dto;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.DM_DuLieuDanhMucService;
using Hinet.Service.DM_DuLieuDanhMucService.Dto;
using Hinet.Service.DM_DuLieuDanhMucService.Request;
using Hinet.Service.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Hinet.Controllers.AccountController;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class DM_DuLieuDanhMucController : HinetController
    {
        private readonly IDM_DuLieuDanhMucService _dM_DuLieuDanhMucService;

        private readonly IMapper _mapper;
        private readonly ILogger<DM_DuLieuDanhMucController> _logger;

        public DM_DuLieuDanhMucController(
            IDM_DuLieuDanhMucService dM_DuLieuDanhMucService,
            IMapper mapper,
            ILogger<DM_DuLieuDanhMucController> logger
            )
        {
            this._dM_DuLieuDanhMucService = dM_DuLieuDanhMucService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<DM_DuLieuDanhMuc>> Create([FromBody] DM_DuLieuDanhMucRequest model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (_dM_DuLieuDanhMucService.FindBy(x => x.Code.Equals(model.Code) && x.GroupId == model.GroupId).Any())
                    {
                        return DataResponse<DM_DuLieuDanhMuc>.False("Mã danh mục đã tồn tại!");
                    }

                    var entity = _mapper.Map<DM_DuLieuDanhMucRequest, DM_DuLieuDanhMuc>(model);
                    await _dM_DuLieuDanhMucService.CreateAsync(entity);



                    return new DataResponse<DM_DuLieuDanhMuc>() { Data = entity, Status = true };
                }
                catch (Exception ex)
                {
                    return DataResponse<DM_DuLieuDanhMuc>.False("Error", new string[] { ex.Message });
                }
            }
            return DataResponse<DM_DuLieuDanhMuc>.False("Some properties are not valid", ModelStateError);
        }

        [HttpPut("Update")]
        public async Task<DataResponse<DM_DuLieuDanhMuc>> Update([FromBody] DM_DuLieuDanhMucRequest model)
        {
            try
            {
                var entity = await _dM_DuLieuDanhMucService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<DM_DuLieuDanhMuc>.False("Không tìm thấy danh mục để sửa!");

                if (_dM_DuLieuDanhMucService.FindBy(x => x.Code.Equals(model.Code) && x.GroupId == model.GroupId && x.Id != model.Id).Any())
                {
                    return DataResponse<DM_DuLieuDanhMuc>.False("Mã danh mục đã tồn tại!");
                }

                entity = _mapper.Map(model, entity);



                await _dM_DuLieuDanhMucService.UpdateAsync(entity);
                return new DataResponse<DM_DuLieuDanhMuc>() { Data = entity, Status = true };
            }
            catch (Exception ex)
            {
                return DataResponse<DM_DuLieuDanhMuc>.False(ex.Message);
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<DM_DuLieuDanhMucDto>> Get(Guid id)
        {
            var result = await _dM_DuLieuDanhMucService.GetDto(id);

            return new DataResponse<DM_DuLieuDanhMucDto>
            {
                Data = result,
                Message = "Get DM_DuLieuDanhMucDto thành công",
                Status = true
            };
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<DM_DuLieuDanhMucDto>>> GetData([FromBody] DM_DuLieuDanhMucSearch search)
        {
            var result = await _dM_DuLieuDanhMucService.GetData(search);
            return new DataResponse<PagedList<DM_DuLieuDanhMucDto>>
            {
                Data = result,
                Message = "GetData PagedList<DM_DuLieuDanhMucDto> thành công",
                Status = true
            };
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _dM_DuLieuDanhMucService.GetByIdAsync(id);
                await _dM_DuLieuDanhMucService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                return DataResponse.False(ex.Message);
            }
        }

        [HttpPost("Export")]
        public async Task<DataResponse> ExportExcel([FromBody] DM_DuLieuDanhMucSearch search)
        {
            try
            {
                var data = await _dM_DuLieuDanhMucService.GetData(search);
                var exportData = new List<DM_DuLieuDanhMucExportDto>();
                foreach (var item in data.Items)
                {
                    var nhomDanhMucExport = new DM_DuLieuDanhMucExportDto()
                    {
                        Code = item.Code,
                        Name = item.Name,
                        Priority = item.Priority,
                        Note = item.Note
                    };
                    exportData.Add(nhomDanhMucExport);
                }

                var base64Excel = await ExportExcelHelperNetCore.Export<DM_DuLieuDanhMucExportDto>(exportData);

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

        [AllowAnonymous]
        [HttpGet("GetDropdown/{GroupCode}")]
        public async Task<DataResponse> GetDropdown(string GroupCode)
        {
            var result = new DataResponse();
            try
            {
                result.Data = await _dM_DuLieuDanhMucService.GetDropdownByGroupCode(GroupCode);
                result.Status = true;
                result.Message = "Lấy dropdown danh mục thành công";
            }
            catch (Exception)
            {
                result.Data = null;
                result.Status = false;
                result.Message = "Lấy danh mục không thành công!";
            }
            return result;
        }

        [HttpGet("GetDropdownCode/{GroupCode}")]
        public async Task<DataResponse> GetDropdownCode(string GroupCode)
        {
            var result = new DataResponse();
            try
            {
                result.Data = await _dM_DuLieuDanhMucService.GetDropdownCodeByGroupCode(GroupCode);
                result.Status = true;
                result.Message = "Lấy dropdown danh mục thành công";
            }
            catch (Exception)
            {
                result.Data = null;
                result.Status = false;
                result.Message = "Lấy danh mục không thành công!";
            }
            return result;
        }

        [HttpGet("GetListDataByGroupCode/{GroupCode}")]
        public async Task<DataResponse<List<DM_DuLieuDanhMucDto>>> GetListDataByGroupCode(string GroupCode)
        {
            var result = await _dM_DuLieuDanhMucService.GetListDataByGroupCode(GroupCode);
            return new DataResponse<List<DM_DuLieuDanhMucDto>>
            {
                Data = result,
                Message = "GetData List<DM_DuLieuDanhMucDto> thành công",
                Status = true
            };
        }


        [HttpGet("GetAllByGroupCode/{GroupCode}")]
        [AllowAnonymous]
        public async Task<DataResponse<List<DM_DuLieuDanhMucDto>>> GetAllByGroupCode(string GroupCode)
        {
            var result = await _dM_DuLieuDanhMucService.GetListDataByGroupCode(GroupCode);
            return new DataResponse<List<DM_DuLieuDanhMucDto>>
            {
                Data = result,
                Message = "GetData List<DM_DuLieuDanhMucDto> thành công",
                Status = true
            };
        }

        [HttpGet("GetChucVuThuTu")]
        [AllowAnonymous]
        public async Task<DataResponse<List<ChucVuThuTuDto>>> GetChucVuThuTu()
        {
            var result = await _dM_DuLieuDanhMucService.GetChucVuThuTu();
            return new DataResponse<List<ChucVuThuTuDto>>
            {
                Data = result,
                Message = "GetChucVuThuTu List<ChucVuThuTuDto> thành công",
                Status = true
            };
        }
    }
}
