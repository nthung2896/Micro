using CommonHelper.Excel;
using Microsoft.AspNetCore.Authorization;
using CommonHelper.Extenions;
using Hinet.Api.Dto;
using Hinet.Api.Filter;
using Hinet.Api.Request.Import;
using Hinet.Domain.Entites;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.Dto;
using Hinet.Service.HuyenService;
using Hinet.Service.HuyenService.Dto;
using Hinet.Service.HuyenService.Request;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Service.TinhService.Dto;
using Hinet.Web.Common;
using Microsoft.AspNetCore.Mvc;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class HuyenController : HinetController
    {
        private readonly IHuyenService _huyenService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<HuyenController> _logger;

        public HuyenController(
            IHuyenService huyenService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<HuyenController> logger
            )
        {
            this._huyenService = huyenService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<Huyen>> Create([FromBody] HuyenRequest model)
        {
            try
            {
                var entity = _mapper.Map<HuyenRequest, Huyen>(model);
                await _huyenService.CreateAsync(entity);
                return DataResponse<Huyen>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo Huyen");
                return DataResponse<Huyen>.False(ex.Message);
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<Huyen>> Update([FromBody] HuyenRequest model)
        {
            try
            {
                var entity = await _huyenService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<Huyen>.False("Huyen không tồn tại");

                entity = _mapper.Map(model, entity);
                await _huyenService.UpdateAsync(entity);
                return DataResponse<Huyen>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật Huyen với Id: {Id}", model.Id);
                return new DataResponse<Huyen>()
                {
                    Data = null,
                    Status = false,
                    Message = ex.Message
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<HuyenDto>> Get(Guid id)
        {
            var dto = await _huyenService.GetDto(id);
            return DataResponse<HuyenDto>.Success(dto);
        }

        [AllowAnonymous]
        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<HuyenDto>>> GetData([FromBody] HuyenSearch search)
        {
            var data = await _huyenService.GetData(search);
            return DataResponse<PagedList<HuyenDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _huyenService.GetByIdAsync(id);
                await _huyenService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa Huyen với Id: {Id}", id);
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


        [HttpPost("ExportExcel")]
        public async Task<DataResponse> ExportExcel([FromBody] HuyenSearch search)
        {
            try
            {
                var data = await _huyenService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<HuyenDto>(data?.Items);
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

        [HttpGet("ExportTemplateImport")]
        public async Task<DataResponse<string>> ExportTemplateImport()
        {
            try
            {
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                ExcelImportExtention.CreateExcelWithDisplayNames<Huyen>(rootPath, "Huyen");
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "Huyen");
                if (string.IsNullOrEmpty(base64))
                {
                    return DataResponse<string>.False("Kết xuất thất bại hoặc dữ liệu trống");
                }
                return DataResponse<string>.Success(base64);
            }
            catch (Exception)
            {
                return DataResponse<string>.False("Kết xuất thất bại");
            }
        }

        [HttpGet("Import")]
        public async Task<DataResponse> Import()
        {
            try
            {
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                ExcelImportExtention.CreateExcelWithDisplayNames<Huyen>(rootPath, "Huyen");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<Huyen>();
                return DataResponse.Success(columns);
            }
            catch (Exception)
            {
                return DataResponse.False("Lấy dữ liệu màn hình import thất bại");
            }
        }

        [HttpPost("ImportExcel")]
        public async Task<DataResponse> ImportExcel([FromBody] DataImport data)
        {
            try
            {
                //data.Collection = data.Collection.OrderBy(x => x.Order).ToList();
                #region Config để import dữ liệu    
                var filePathQuery = await _taiLieuDinhKemService.GetPathFromId(data.IdFile);
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/");
                string filePath = rootPath + filePathQuery;

                var importHelper = new ImportExcelHelperNetCore<Huyen>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<Huyen>(data.Collection)
                       .Where(x => x.NumberColumn > 0)
                       .OrderBy(x => x.NumberColumn)
                       .ToList();
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<Huyen>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                }
                var response = new ResponseImport<Huyen>();

                response.ListTrue = listImportReponse;
                response.lstFalse = rsl.lstFalse;

                return DataResponse.Success(response);
            }
            catch (Exception)
            {
                return DataResponse.False("Import thất bại");
            }
        }

        [HttpPost("SaveImport")]
        public async Task<DataResponse> SaveImport([FromBody] List<HuyenRequest> data)
        {
            try
            {
                if (data == null || !data.Any())
                    return DataResponse.False("Không có dữ liệu để lưu");

                //await _huyenService.CreateAsync(data);
                return DataResponse.Success("Lưu thành công");
            }
            catch (Exception ex)
            {
                return DataResponse.False("Lưu thất bại: " + ex.Message);
            }
        }

        [HttpPost("SaveImport2")]
        public async Task<DataResponse> SaveImport2([FromBody] List<HuyenRequest> data)
        {
            try
            {
                if (data == null || !data.Any())
                    return DataResponse.False("Không có dữ liệu để lưu");

                //await _huyenService.CreateAsync(data);
                return DataResponse.Success("Lưu thành công");
            }
            catch (Exception ex)
            {
                return DataResponse.False("Lưu thất bại: " + ex.Message);
            }
        }
        [HttpPost("SaveImport3")]
        public async Task<DataResponse> SaveImport3([FromBody] List<HuyenRequest> data)
        {
            try
            {
                if (data == null || !data.Any())
                    return DataResponse.False("Không có dữ liệu để lưu");

                //await _huyenService.CreateAsync(data);
                return DataResponse.Success("Lưu thành công");
            }
            catch (Exception ex)
            {
                return DataResponse.False("Lưu thất bại: " + ex.Message);
            }
        }

        [HttpPost("SaveImport4")]
        public async Task<DataResponse> SaveImport4([FromBody] List<HuyenRequest> data)
        {
            try
            {
                if (data == null || !data.Any())
                    return DataResponse.False("Không có dữ liệu để lưu");

                //await _huyenService.CreateAsync(data);
                return DataResponse.Success("Lưu thành công");
            }
            catch (Exception ex)
            {
                return DataResponse.False("Lưu thất bại: " + ex.Message);
            }
        }
    }
}
