using CommonHelper.Excel;
using CommonHelper.Extenions;
using CommonHelper.String;
using Elastic.Clients.Elasticsearch;
using Hinet.Api.Dto;
using Hinet.Api.Filter;
using Hinet.Api.Request.Import;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.Dto;
using Hinet.Service.KPI_BoTieuChiDonViService;
using Hinet.Service.KPI_BoTieuChiDonViService.Dto;
using Hinet.Service.KPI_BoTieuChiDonViService.ViewModels;
using Hinet.Service.KPI_NhomTieuChiService;
using Hinet.Service.KPI_CauHinhDiemTheoHeSoLanhDaoService;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Service.KPI_DotDanhGia_DonViService;
using Hinet.Web.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pipelines.Sockets.Unofficial;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_BoTieuChiDonViController : HinetController
    {
        private readonly IKPI_BoTieuChiDonViService _kPI_BoTieuChiDonViService;
        private readonly IKPI_NhomTieuChiService _kPI_NhomTieuChiService;
        private readonly IKPI_CauHinhDiemTheoHeSoLanhDaoService _kPI_CauHinhDiemTheoHeSoLanhDaoService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_BoTieuChiDonViController> _logger;
        private readonly IKPI_DotDanhGia_DonViService _kPI_DotDanhGia_DonViService;

        public KPI_BoTieuChiDonViController(
            IKPI_BoTieuChiDonViService kPI_BoTieuChiDonViService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<KPI_BoTieuChiDonViController> logger,
            IKPI_CauHinhDiemTheoHeSoLanhDaoService kPI_CauHinhDiemTheoHeSoLanhDaoService,
            IKPI_NhomTieuChiService kPI_NhomTieuChiService,
            IKPI_DotDanhGia_DonViService kPI_DotDanhGia_DonViService)
        {
            this._kPI_BoTieuChiDonViService = kPI_BoTieuChiDonViService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._mapper = mapper;
            _logger = logger;
            _kPI_NhomTieuChiService = kPI_NhomTieuChiService;
            _kPI_CauHinhDiemTheoHeSoLanhDaoService = kPI_CauHinhDiemTheoHeSoLanhDaoService;
            this._kPI_DotDanhGia_DonViService = kPI_DotDanhGia_DonViService;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_BoTieuChiDonVi>> Create([FromBody] KPI_BoTieuChiDonViCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_BoTieuChiDonViCreateVM, KPI_BoTieuChiDonVi>(model);
                entity.Is_locked = false;
                await _kPI_BoTieuChiDonViService.CreateAsync(entity);

                if (entity.IdDonVi.HasValue)
                {
                    await _kPI_BoTieuChiDonViService.SetActiveBoTieuChiDonViAsync(entity.Id, entity.IdDonVi.Value);
                }

                return DataResponse<KPI_BoTieuChiDonVi>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_BoTieuChiDonVi");
                return DataResponse<KPI_BoTieuChiDonVi>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<KPI_BoTieuChiDonVi>> Update([FromBody] KPI_BoTieuChiDonViEditVM model)
        {
            try
            {
                var entity = await _kPI_BoTieuChiDonViService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_BoTieuChiDonVi>.False("KPI_BoTieuChiDonVi không tồn tại");

                var dto = await _kPI_BoTieuChiDonViService.GetDto(model.Id.Value);
                if (dto != null && dto.Is_locked)
                {
                    return DataResponse<KPI_BoTieuChiDonVi>.False("Bộ tiêu chí này đã bị khóa (do thuộc đợt đánh giá đã kết thúc/đóng), không thể chỉnh sửa.");
                }

                entity = _mapper.Map(model, entity);
                await _kPI_BoTieuChiDonViService.UpdateAsync(entity);
                return DataResponse<KPI_BoTieuChiDonVi>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_BoTieuChiDonVi với Id: {Id}", model.Id);
                return new DataResponse<KPI_BoTieuChiDonVi>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_BoTieuChiDonViDto>> Get(Guid id)
        {
            var dto = await _kPI_BoTieuChiDonViService.GetDto(id);
            return DataResponse<KPI_BoTieuChiDonViDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_BoTieuChiDonViDto>>> GetData([FromBody] KPI_BoTieuChiDonViSearch search)
        {
            if (HasRole("CucTruong"))
            {
                search.IdDonVi = DonViId;
            }
            var data = await _kPI_BoTieuChiDonViService.GetData(search);
            return DataResponse<PagedList<KPI_BoTieuChiDonViDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_BoTieuChiDonViService.GetByIdAsync(id);
                if (entity == null)
                    return DataResponse.False("Bộ tiêu chí không tồn tại.");

                var dto = await _kPI_BoTieuChiDonViService.GetDto(id);
                // if (dto != null && dto.Is_locked)
                // {
                //     return DataResponse.False("Bộ tiêu chí này đã bị khóa (do thuộc đợt đánh giá đã kết thúc/đóng), không thể xóa.");
                // }

                var listNhomTieuChi = await _kPI_NhomTieuChiService
                    .GetQueryable()
                    .Where(x => x.IdBoTieuChiDonVi == id)
                    .ToListAsync();

                await _kPI_NhomTieuChiService.DeleteRange(listNhomTieuChi);

                var listDotDanhGiaDonVi = await _kPI_DotDanhGia_DonViService
                    .GetQueryable()
                    .Where(x => x.IdBoChiSoNhiemVu == id)
                    .ToListAsync();
                
                if (listDotDanhGiaDonVi.Any())
                {
                    await _kPI_DotDanhGia_DonViService.DeleteRange(listDotDanhGiaDonVi);
                }

                await _kPI_BoTieuChiDonViService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_BoTieuChiDonVi với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
            }
        }

        [HttpGet("GetDropdown")]
        public async Task<DataResponse<List<DropdownOption>>> GetDropdown([FromQuery] Guid? idDonVi)
        {
            var query = _kPI_BoTieuChiDonViService.GetQueryable();
            if (idDonVi.HasValue)
            {
                query = query.Where(x => x.IdDonVi == idDonVi.Value);
            }
            var list = await query
                .OrderBy(x => x.Is_locked) // Is_locked == false (Mở) lên trước
                .ThenBy(x => x.TenBoTieuChiDonVi)
                .Select(x => new DropdownOption
                {
                    Value = x.Id.ToString(),
                    Label = !string.IsNullOrEmpty(x.SoQuyetDinh)
                        ? $"{x.TenBoTieuChiDonVi} (Số QĐ: {x.SoQuyetDinh}){(!x.Is_locked ? " [Đang áp dụng]" : "")}"
                        : $"{x.TenBoTieuChiDonVi}{(!x.Is_locked ? " [Đang áp dụng]" : "")}",
                    Selected = !x.Is_locked
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


        [HttpPost("exportExcel")]
        public async Task<DataResponse> ExportExcel([FromBody] KPI_BoTieuChiDonViSearch search)
        {
            try
            {
                var data = await _kPI_BoTieuChiDonViService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_BoTieuChiDonViDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_BoTieuChiDonVi");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_BoTieuChiDonVi>(rootPath, "KPI_BoTieuChiDonVi");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_BoTieuChiDonVi>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_BoTieuChiDonVi>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_BoTieuChiDonVi>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_BoTieuChiDonVi>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_BoTieuChiDonViService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_BoTieuChiDonVi>();


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
        public async Task<DataResponse<KPI_BoTieuChiDonVi>> Clone(Guid id, [FromServices] ElasticsearchClient elasticClient, [FromBody] CloneBoTieuChiRequest? request = null)
        {
            try
            {
                var original = await _kPI_BoTieuChiDonViService.GetByIdAsync(id);
                if (original == null)
                    return DataResponse<KPI_BoTieuChiDonVi>.False("Không tìm thấy bộ tiêu chí gốc");

                // 1. Clone BoTieuChiDonVi
                var newBoTieuChi = new KPI_BoTieuChiDonVi
                {
                    SoQuyetDinh = original.SoQuyetDinh,
                    TenBoTieuChiDonVi = !string.IsNullOrWhiteSpace(request?.TenBoTieuChiDonVi)
                        ? request.TenBoTieuChiDonVi
                        : (original.TenBoTieuChiDonVi + " (Bản sao)"),
                    IdDonVi = request?.IdDonVi ?? original.IdDonVi,
                    IdDot = request?.IdDot ?? original.IdDot,
                    NgayQuyetDinh = original.NgayQuyetDinh,
                    ApDungTuNgay = original.ApDungTuNgay,
                    ApDungToiNgay = original.ApDungToiNgay,
                    Is_locked = false
                };
                await _kPI_BoTieuChiDonViService.CreateAsync(newBoTieuChi);

                if (newBoTieuChi.IdDonVi.HasValue)
                {
                    await _kPI_BoTieuChiDonViService.SetActiveBoTieuChiDonViAsync(newBoTieuChi.Id, newBoTieuChi.IdDonVi.Value);
                }

                // 2. Clone KPI_NhomTieuChi
                var listNhomTieuChi = await _kPI_NhomTieuChiService.GetQueryable()
                    .Where(x => x.IdBoTieuChiDonVi == id && x.IsDeleted != true)
                    .AsNoTracking()
                    .ToListAsync();

                var oldToNewIdMap = new Dictionary<Guid, Guid>();
                
                foreach (var item in listNhomTieuChi)
                {
                    var newId = Guid.NewGuid();
                    oldToNewIdMap[item.Id] = newId;
                    item.Id = newId;
                    item.IdBoTieuChiDonVi = newBoTieuChi.Id;
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

                // Map ParentID
                foreach (var item in listNhomTieuChi)
                {
                    if (item.ParentID.HasValue && oldToNewIdMap.ContainsKey(item.ParentID.Value))
                    {
                        item.ParentID = oldToNewIdMap[item.ParentID.Value];
                    }
                }

                if (listNhomTieuChi.Any())
                {
                    await _kPI_NhomTieuChiService.CreateAsync(listNhomTieuChi);

                    try
                    {
                        var syncData = listNhomTieuChi.Select(x => new
                        {
                            Id = x.Id,
                            TenNhomTieuChi = x.TenNhomTieuChi,
                            TenNhomTieuChiKhongDau = x.TenNhomTieuChi?.ConvertToUnsign(),
                            CongViecChiTiet = x.CongViecChiTiet,
                            CongViecChiTietKhongDau = x.CongViecChiTiet?.ConvertToUnsign(),
                            SanPhamDauRa = x.SanPhamDauRa,
                            SanPhamDauRaKhongDau = x.SanPhamDauRa?.ConvertToUnsign(),
                            Level = x.Level,
                            Diem = x.Diem,
                            HeSoQuyDoi = x.HeSoQuyDoi,
                            GhiChu = x.GhiChu,
                            ParentID = x.ParentID,
                            IdBoTieuChiDonVi = x.IdBoTieuChiDonVi,
                            CreatedAt = x.CreatedDate,
                            UpdatedAt = x.UpdatedDate
                        }).ToList();

                        await elasticClient.BulkAsync(b => b
                            .Index("kpi_nhomtieuchi_index")
                            .IndexMany(syncData, (descriptor, doc) => descriptor.Id(doc.Id.ToString()))
                        );
                    }
                    catch (Exception exEl)
                    {
                        _logger.LogError(exEl, "Lỗi khi tự động sync Elastic khi clone bộ tiêu chí");
                    }
                }

                // 3. Clone KPI_CauHinhDiemTheoHeSoLanhDao
                var listCauHinh = await _kPI_CauHinhDiemTheoHeSoLanhDaoService.GetQueryable()
                    .Where(x => x.IdBoTieuChi == id && x.IsDeleted != true)
                    .AsNoTracking()
                    .ToListAsync();

                foreach (var item in listCauHinh)
                {
                    item.Id = Guid.NewGuid();
                    item.IdBoTieuChi = newBoTieuChi.Id;
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

                if (listCauHinh.Any())
                {
                    await _kPI_CauHinhDiemTheoHeSoLanhDaoService.CreateAsync(listCauHinh);
                }

                return DataResponse<KPI_BoTieuChiDonVi>.Success(newBoTieuChi, "Nhân bản bộ tiêu chí thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi clone bộ tiêu chí");
                return DataResponse<KPI_BoTieuChiDonVi>.False("Đã xảy ra lỗi khi nhân bản.");
            }
        }

        [HttpPost("ToggleLock/{id}")]
        public async Task<DataResponse> ToggleLock(Guid id)
        {
            try
            {
                var entity = await _kPI_BoTieuChiDonViService.GetByIdAsync(id);
                if (entity == null)
                {
                    return DataResponse.False("Không tìm thấy bộ tiêu chí.");
                }

                entity.Is_locked = !entity.Is_locked;
                await _kPI_BoTieuChiDonViService.UpdateAsync(entity);

                // Nếu mở khóa (Is_locked == false) và có IdDonVi, tự động khóa các bộ khác cùng đơn vị
                if (!entity.Is_locked && entity.IdDonVi.HasValue)
                {
                    await _kPI_BoTieuChiDonViService.SetActiveBoTieuChiDonViAsync(entity.Id, entity.IdDonVi.Value);
                }

                string msg = entity.Is_locked ? "Đã khóa bộ tiêu chí thành công." : "Đã mở khóa và kích hoạt bộ tiêu chí thành công.";
                return DataResponse.Success(new { Is_locked = entity.Is_locked }, msg);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thay đổi trạng thái khóa bộ tiêu chí");
                return DataResponse.False("Đã xảy ra lỗi: " + ex.Message);
            }
        }
    }
}
