using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Hinet.Model.Entities;
using Hinet.Service.Room_BangGiaService;
using Hinet.Service.Room_BangGiaService.Dto;
using Hinet.Service.Room_BangGiaService.ViewModels;
using Hinet.Service.Common;
using Hinet.Api.Filter;
using CommonHelper.Excel;
using CommonHelper.Extenions;
using Hinet.Web.Common;
//using Hinet.Api.ViewModels.Import;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Api.Dto;
using Hinet.Service.Dto;
using Hinet.Service.Constant;
using Hinet.Api.Request.Import;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class Room_BangGiaController : HinetController
    {
        private readonly IRoom_BangGiaService _room_BangGiaService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<Room_BangGiaController> _logger;

        public Room_BangGiaController(
            IRoom_BangGiaService room_BangGiaService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<Room_BangGiaController> logger
            )
        {
            this._room_BangGiaService = room_BangGiaService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<Room_BangGia>> Create([FromBody] Room_BangGiaCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<Room_BangGiaCreateVM, Room_BangGia>(model);
                await _room_BangGiaService.CreateAsync(entity);
                return DataResponse<Room_BangGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo Room_BangGia");
                return DataResponse<Room_BangGia>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<Room_BangGia>> Update([FromBody] Room_BangGiaEditVM model)
        {
            try
            {
                var entity = await _room_BangGiaService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<Room_BangGia>.False("Room_BangGia không tồn tại");

                entity = _mapper.Map(model, entity);
                await _room_BangGiaService.UpdateAsync(entity);
                return DataResponse<Room_BangGia>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật Room_BangGia với Id: {Id}", model.Id);
                return new DataResponse<Room_BangGia>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<Room_BangGiaDto>> Get(Guid id)
        {
            var dto = await _room_BangGiaService.GetDto(id);
            return DataResponse<Room_BangGiaDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [AllowAnonymous]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<Room_BangGiaDto>>> GetData([FromBody] Room_BangGiaSearch search)
        {
            var data = await _room_BangGiaService.GetData(search);
            return DataResponse<PagedList<Room_BangGiaDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _room_BangGiaService.GetByIdAsync(id);
                await _room_BangGiaService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa Room_BangGia với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
            }
        }

        [HttpGet("GetDropdowns")]
        [AllowAnonymous]
        public async Task<DataResponse<Dictionary<string, List<DropdownOption>>>> GetDropdowns([FromQuery] string[] types)
        {
            var result = new Dictionary<string, List<DropdownOption>>()
			{
			};

            return DataResponse<Dictionary<string, List<DropdownOption>>>.Success(result);
        }


        [HttpGet("export")]
        public async Task<DataResponse> ExportExcel()
        {
            try
            {
                var search = new Room_BangGiaSearch();
                var data = await _room_BangGiaService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<Room_BangGiaDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "Room_BangGia");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<Room_BangGia>(rootPath, "Room_BangGia");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<Room_BangGia>();
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
                #region Config để import dữ liệu    
                var filePathQuery = await _taiLieuDinhKemService.GetPathFromId(data.IdFile);
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
                string filePath = rootPath + filePathQuery;

                var importHelper = new ImportExcelHelperNetCore<Room_BangGia>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<Room_BangGia>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<Room_BangGia>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _room_BangGiaService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<Room_BangGia>();


                response.ListTrue = listImportReponse;
                response.lstFalse = rsl.lstFalse;

                return DataResponse.Success(response);
            }
            catch (Exception)
            {
                return DataResponse.False("Import thất bại");
            }
        }
    }
}
