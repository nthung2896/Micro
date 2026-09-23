using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.TinhService;
using Hinet.Service.TinhService.Dto;
using Hinet.Service.TinhService.Request;
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
using VKS.Domain.Entites;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class TinhController : HinetController
    {
        private readonly ITinhService _tinhService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<TinhController> _logger;

        public TinhController(
            ITinhService tinhService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<TinhController> logger
            )
        {
            this._tinhService = tinhService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<Tinh>> Create([FromBody] TinhRequest model)
        {
            try
            {
                var entity = _mapper.Map<TinhRequest, Tinh>(model);
                await _tinhService.CreateAsync(entity);
                return DataResponse<Tinh>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo Tinh");
                return DataResponse<Tinh>.False($"Đã xảy ra lỗi khi tạo dữ liệu. {ex.Message}");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<Tinh>> Update([FromBody] TinhRequest model)
        {
            try
            {
                var entity = await _tinhService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<Tinh>.False("Tinh không tồn tại");

                entity = _mapper.Map(model, entity);
                await _tinhService.UpdateAsync(entity);
                return DataResponse<Tinh>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật Tinh với Id: {Id}", model.Id);
                return new DataResponse<Tinh>()
                {
                    Data = null,
                    Status = false,
                    Message = ex.Message,
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<TinhDto>> Get(Guid id)
        {
            var dto = await _tinhService.GetDto(id);
            return DataResponse<TinhDto>.Success(dto);
        }

        [AllowAnonymous]
        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<TinhDto>>> GetData([FromBody] TinhSearch search)
        {
            var data = await _tinhService.GetData(search);
            return DataResponse<PagedList<TinhDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _tinhService.GetByIdAsync(id);
                await _tinhService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa Tinh với Id: {Id}", id);
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
        public async Task<DataResponse> ExportExcel([FromBody] TinhSearch search)
        {
            try
            {
                var data = await _tinhService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<TinhDto>(data?.Items);
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
                ExcelImportExtention.CreateExcelWithDisplayNames<Tinh>(rootPath, "Tinh");
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "Tinh");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<Tinh>(rootPath, "Tinh");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<Tinh>();
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
                //data.Collection = data.Collection.OrderBy(e => e.Order).ToList();
                #region Config để import dữ liệu    
                var filePathQuery = await _taiLieuDinhKemService.GetPathFromId(data.IdFile);
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads/");
                string filePath = rootPath + filePathQuery;

                var importHelper = new ImportExcelHelperNetCore<Tinh>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = ExcelImportExtention
                       .GetConfigCol<Tinh>(data.Collection)
                       .Where(x => x.NumberColumn > 0)
                       .OrderBy(x => x.NumberColumn)
                       .ToList();
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<Tinh>();
                var response = new ResponseImport<Tinh>();

                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                }
                response.ListTrue = listImportReponse;
                response.lstFalse = rsl.lstFalse;

                return DataResponse.Success(response);
            }
            catch (Exception ex)
            {
                return DataResponse.False("Import thất bại");
            }
        }

        [HttpPost("SaveImport")]
        public async Task<DataResponse> SaveImport([FromBody] List<TinhRequest> data)
        {
            try
            {
                if (data == null || !data.Any())
                    return DataResponse.False("Không có dữ liệu để lưu");
                var tinhs = _mapper.Map<List<TinhRequest>, List<Tinh>>(data);
                await _tinhService.CreateAsync(tinhs);
                return DataResponse.Success("Lưu thành công");
            }
            catch (Exception ex)
            {
                return DataResponse.False("Lưu thất bại: " + ex.Message);
            }
        }
    }
}