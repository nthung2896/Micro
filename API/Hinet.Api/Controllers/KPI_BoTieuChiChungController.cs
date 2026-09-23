using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.KPI_BoTieuChiChungService;
using Hinet.Service.KPI_BoTieuChiChungService.Dto;
using Hinet.Service.KPI_BoTieuChiChungService.ViewModels;
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
using Hinet.Service.KPI_TieuChiChungService;
using Hinet.Service.KPI_DotDanhGia_DonViService;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_BoTieuChiChungController : HinetController
    {
        private readonly IKPI_BoTieuChiChungService _kPI_BoTieuChiChungService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_BoTieuChiChungController> _logger;
        private readonly IKPI_DotDanhGia_DonViService _kPI_DotDanhGia_DonViService;

        public KPI_BoTieuChiChungController(
            IKPI_BoTieuChiChungService kPI_BoTieuChiChungService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<KPI_BoTieuChiChungController> logger,
            IKPI_DotDanhGia_DonViService kPI_DotDanhGia_DonViService
            )
        {
            this._kPI_BoTieuChiChungService = kPI_BoTieuChiChungService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
            this._kPI_DotDanhGia_DonViService = kPI_DotDanhGia_DonViService;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_BoTieuChiChung>> Create([FromBody] KPI_BoTieuChiChungCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_BoTieuChiChungCreateVM, KPI_BoTieuChiChung>(model);
                entity.IsActive = model.IsActive ?? true;
                await _kPI_BoTieuChiChungService.CreateAsync(entity);

                if (entity.IsActive == true && entity.IdDonVi.HasValue)
                {
                    await _kPI_BoTieuChiChungService.SetActiveBoTieuChiChungAsync(entity.Id, entity.IdDonVi.Value, entity.Type);
                }

                return DataResponse<KPI_BoTieuChiChung>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_BoTieuChiChung");
                return DataResponse<KPI_BoTieuChiChung>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<KPI_BoTieuChiChung>> Update([FromBody] KPI_BoTieuChiChungEditVM model)
        {
            try
            {
                var entity = await _kPI_BoTieuChiChungService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_BoTieuChiChung>.False("KPI_BoTieuChiChung không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_BoTieuChiChungService.UpdateAsync(entity);

                if (entity.IsActive == true && entity.IdDonVi.HasValue)
                {
                    await _kPI_BoTieuChiChungService.SetActiveBoTieuChiChungAsync(entity.Id, entity.IdDonVi.Value, entity.Type);
                }

                return DataResponse<KPI_BoTieuChiChung>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_BoTieuChiChung với Id: {Id}", model.Id);
                return new DataResponse<KPI_BoTieuChiChung>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_BoTieuChiChungDto>> Get(Guid id)
        {
            var dto = await _kPI_BoTieuChiChungService.GetDto(id);
            return DataResponse<KPI_BoTieuChiChungDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_BoTieuChiChungDto>>> GetData([FromBody] KPI_BoTieuChiChungSearch search)
        {
            var data = await _kPI_BoTieuChiChungService.GetData(search);
            return DataResponse<PagedList<KPI_BoTieuChiChungDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_BoTieuChiChungService.GetByIdAsync(id);

                var listDotDanhGiaDonVi = await _kPI_DotDanhGia_DonViService
                    .GetQueryable()
                    .Where(x => x.IdBoTieuChiChung == id)
                    .ToListAsync();
                
                if (listDotDanhGiaDonVi.Any())
                {
                    await _kPI_DotDanhGia_DonViService.DeleteRange(listDotDanhGiaDonVi);
                }

                await _kPI_BoTieuChiChungService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_BoTieuChiChung với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
            }
        }

        [HttpGet("GetDropdown")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdown([FromQuery] Guid? idDonVi = null, [FromQuery] string? type = null, [FromQuery] bool? onlyActive = null)
        {
            var query = _kPI_BoTieuChiChungService.GetQueryable().Where(x => !x.IsDeleted);
            if (idDonVi.HasValue)
            {
                query = query.Where(x => x.IdDonVi == idDonVi.Value);
            }
            if (!string.IsNullOrEmpty(type))
            {
                if (type == LoaiDotDanhGiaConstant.TAP_THE || type == "TapThe")
                {
                    query = query.Where(x => x.Type == LoaiDotDanhGiaConstant.TAP_THE || x.Type == "TapThe" || (x.Type == null && EF.Functions.ILike(x.TenBoTieuChiDonVi, "%tập thể%")));
                }
                else
                {
                    query = query.Where(x => x.Type != LoaiDotDanhGiaConstant.TAP_THE && x.Type != "TapThe" && (x.TenBoTieuChiDonVi == null || !EF.Functions.ILike(x.TenBoTieuChiDonVi, "%tập thể%")));
                }
            }
            if (onlyActive == true)
            {
                query = query.Where(x => x.IsActive == true);
            }

            var list = await query
                .OrderByDescending(x => x.IsActive == true)
                .ThenBy(x => x.TenBoTieuChiDonVi)
                .Select(x => new DropdownOption
                {
                    Value = x.Id.ToString(),
                    Label = !string.IsNullOrEmpty(x.SoQuyetDinh)
                        ? $"{x.TenBoTieuChiDonVi} (Số QĐ: {x.SoQuyetDinh}){(x.IsActive == true ? " [Đang áp dụng]" : "")}"
                        : $"{x.TenBoTieuChiDonVi}{(x.IsActive == true ? " [Đang áp dụng]" : "")}",
                    Selected = x.IsActive == true
                })
                .ToListAsync();
            return DataResponse<List<DropdownOption>>.Success(list);
        }

        [HttpGet("GetDropdowns")]
        public async Task<DataResponse<Dictionary<string, List<DropdownOption>>>> GetDropdowns([FromQuery] string[] types)
        {
            var result = new Dictionary<string, List<DropdownOption>>()
			{
			};

            return DataResponse<Dictionary<string, List<DropdownOption>>>.Success(result);
        }


        [HttpGet("export")]
        [HttpPost("exportExcel")]
        public async Task<DataResponse> ExportExcel([FromBody] KPI_BoTieuChiChungSearch? search = null)
        {
            try
            {
                var data = await _kPI_BoTieuChiChungService.GetData(search ?? new KPI_BoTieuChiChungSearch());
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_BoTieuChiChungDto>(data?.Items);
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
            var base64 = await _kPI_BoTieuChiChungService.ExportTemplateImportAsync();
            if (string.IsNullOrEmpty(base64))
            {
                return DataResponse<string>.False("Kết xuất thất bại");
            }
            return DataResponse<string>.Success(base64);
        }

        [HttpPost("CheckFileWorksheet")]
        public async Task<DataResponse> CheckFileWorksheet(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0) return DataResponse.False("Vui lòng chọn file Excel");
                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    stream.Position = 0;
                    OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;
                    using (var package = new OfficeOpenXml.ExcelPackage(stream))
                    {
                        var worksheets = package.Workbook.Worksheets.Where(ws => ws.Hidden == OfficeOpenXml.eWorkSheetHidden.Visible);
                        var listSheets = worksheets.Select(x => x.Name).ToList();
                        return DataResponse.Success(listSheets);
                    }
                }
            }
            catch (Exception ex)
            {
                return DataResponse.False("Lỗi khi kiểm tra file Excel: " + ex.Message);
            }
        }

        [HttpPost("GetHeaderWorksheet")]
        public async Task<DataResponse> GetHeaderWorksheet(IFormFile file, [FromForm] string? WorkSheetName)
        {
            try
            {
                if (file == null || file.Length == 0) return DataResponse.False("Vui lòng chọn file");
                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    stream.Position = 0;
                    OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                    using (var package = new OfficeOpenXml.ExcelPackage(stream))
                    {
                        OfficeOpenXml.ExcelWorksheet? worksheet = null;
                        if (!string.IsNullOrEmpty(WorkSheetName))
                        {
                            worksheet = package.Workbook.Worksheets[WorkSheetName];
                        }
                        if (worksheet == null)
                        {
                            worksheet = package.Workbook.Worksheets.FirstOrDefault(ws => ws.Hidden == OfficeOpenXml.eWorkSheetHidden.Visible);
                        }
                        if (worksheet == null || worksheet.Dimension == null)
                        {
                            return DataResponse.False("Worksheet không có dữ liệu");
                        }

                        int startRow = 4;
                        int dataStartRow = 5;
                        for (int r = 1; r <= Math.Min(worksheet.Dimension.End.Row, 15); r++)
                        {
                            for (int c = 1; c <= Math.Min(worksheet.Dimension.End.Column, 5); c++)
                            {
                                var txt = worksheet.Cells[r, c].Text?.Trim().ToUpper() ?? "";
                                if (txt == "STT" || txt == "TT" || txt == "SỐ TT")
                                {
                                    startRow = r;
                                    dataStartRow = r + 1;
                                    break;
                                }
                            }
                        }

                        return DataResponse.Success(new
                        {
                            startRow = startRow,
                            dataStartRow = dataStartRow,
                            totalColumns = 4
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                return DataResponse.False("Lỗi khi kiểm tra tiêu đề: " + ex.Message);
            }
        }

        [HttpPost("ImportExcelDirect")]
        public async Task<DataResponse> ImportExcelDirect(IFormFile file, [FromForm] KPI_BoTieuChiChungImportVM data)
        {
            var res = await _kPI_BoTieuChiChungService.ImportExcelDirectAsync(file, data);
            if (res.Status)
            {
                return DataResponse.Success(res);
            }
            return DataResponse.False(res.Message ?? "Import thất bại");
        }

        [HttpGet("Import")]
        public async Task<DataResponse> Import()
        {
            try
            {
                string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_BoTieuChiChung>(rootPath, "KPI_BoTieuChiChung");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_BoTieuChiChung>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_BoTieuChiChung>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_BoTieuChiChung>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_BoTieuChiChung>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_BoTieuChiChungService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_BoTieuChiChung>();


                response.ListTrue = listImportReponse;
                response.lstFalse = rsl.lstFalse;

                return DataResponse.Success(response);
            }
            catch (Exception)
            {
                return DataResponse.False("Import thất bại");
            }
        }

        [HttpPost("Clone/{id}")]
        public async Task<DataResponse<KPI_BoTieuChiChung>> Clone(Guid id, [FromServices] IKPI_TieuChiChungService tieuChiChungService, [FromBody] KPI_BoTieuChiChungCreateVM model)
        {
            try
            {
                var original = await _kPI_BoTieuChiChungService.GetByIdAsync(id);
                if (original == null)
                    return DataResponse<KPI_BoTieuChiChung>.False("Không tìm thấy bộ tiêu chí chung gốc");

                // 1. Clone KPI_BoTieuChiChung
                var newBoTieuChi = _mapper.Map<KPI_BoTieuChiChungCreateVM, KPI_BoTieuChiChung>(model);
                newBoTieuChi.IsActive = model.IsActive ?? true;
                await _kPI_BoTieuChiChungService.CreateAsync(newBoTieuChi);

                if (newBoTieuChi.IsActive == true && newBoTieuChi.IdDonVi.HasValue)
                {
                    await _kPI_BoTieuChiChungService.SetActiveBoTieuChiChungAsync(newBoTieuChi.Id, newBoTieuChi.IdDonVi.Value, newBoTieuChi.Type);
                }

                // 2. Clone KPI_TieuChiChung
                var listTieuChiChung = await tieuChiChungService.GetQueryable()
                    .Where(x => x.IdBoTieuChiChung == id && x.IsDeleted != true)
                    .AsNoTracking()
                    .ToListAsync();

                var oldToNewIdMap = new Dictionary<Guid, Guid>();

                foreach (var item in listTieuChiChung)
                {
                    var newId = Guid.NewGuid();
                    oldToNewIdMap[item.Id] = newId;
                    item.Id = newId;
                    item.IdBoTieuChiChung = newBoTieuChi.Id;
                    // Reset auditable fields
                    item.CreatedDate = DateTime.Now;
                    item.CreatedId = null;
                    item.CreatedBy = null;
                    item.UpdatedDate = DateTime.Now;
                    item.UpdatedId = null;
                    item.UpdatedBy = null;
                    item.DeletedDate = null;
                    item.DeletedId = null;
                    item.IsDeleted = false;
                }

                // Map ParentId
                foreach (var item in listTieuChiChung)
                {
                    if (item.ParentId.HasValue && oldToNewIdMap.ContainsKey(item.ParentId.Value))
                    {
                        item.ParentId = oldToNewIdMap[item.ParentId.Value];
                    }
                }

                if (listTieuChiChung.Any())
                {
                    await tieuChiChungService.CreateAsync(listTieuChiChung);
                }

                return DataResponse<KPI_BoTieuChiChung>.Success(newBoTieuChi);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi clone bộ tiêu chí chung");
                return DataResponse<KPI_BoTieuChiChung>.False("Đã xảy ra lỗi khi clone dữ liệu.");
            }
        }

        [HttpPost("ToggleActive/{id}")]
        public async Task<DataResponse> ToggleActive(Guid id)
        {
            try
            {
                var entity = await _kPI_BoTieuChiChungService.GetByIdAsync(id);
                if (entity == null)
                    return DataResponse.False("KPI_BoTieuChiChung không tồn tại");

                entity.IsActive = !(entity.IsActive ?? false);
                await _kPI_BoTieuChiChungService.UpdateAsync(entity);

                if (entity.IsActive == true && entity.IdDonVi.HasValue)
                {
                    await _kPI_BoTieuChiChungService.SetActiveBoTieuChiChungAsync(entity.Id, entity.IdDonVi.Value, entity.Type);
                }

                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi toggle active KPI_BoTieuChiChung: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi thay đổi trạng thái kích hoạt.");
            }
        }
    }
}
