using CommonHelper.Excel;
using CommonHelper.Extenions;
using Hinet.Api.Dto;
using Hinet.Api.Filter;
using Hinet.Api.Request.Import;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.Dto;
using Hinet.Service.KPI_PhieuDanhGiaService.Constant;
using Hinet.Service.KPI_TieuChiChung_DiemSoService;
using Hinet.Service.KPI_TieuChiChung_DiemSoService.Dto;
using Hinet.Service.KPI_TieuChiChung_DiemSoService.ViewModels;
using Hinet.Service.KPI_TieuChiChungService;
using Hinet.Service.KPI_TieuChiChungService.Dto;
using Hinet.Service.KPI_DotTheoDoiDanhGiaService;
using Hinet.Service.KPI_LyLich2CService;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Web.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_TieuChiChung_DiemSoController : HinetController
    {
        private readonly IKPI_TieuChiChung_DiemSoService _kPI_TieuChiChung_DiemSoService;
        private readonly Hinet.Service.KPI_PhieuDanhGiaService.IKPI_PhieuDanhGiaService _kPI_PhieuDanhGiaService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_TieuChiChung_DiemSoController> _logger;
        private readonly IKPI_DotTheoDoiDanhGiaService _kPI_DotTheoDoiDanhGiaService;
        private readonly IKPI_LyLich2CService _kPI_LyLich2CService;
        private readonly IKPI_TieuChiChungService _kPI_TieuChiChungService;

        public KPI_TieuChiChung_DiemSoController(
                IKPI_TieuChiChung_DiemSoService kPI_TieuChiChung_DiemSoService,
                Hinet.Service.KPI_PhieuDanhGiaService.IKPI_PhieuDanhGiaService kPI_PhieuDanhGiaService,
                ITaiLieuDinhKemService taiLieuDinhKemService,
                IMapper mapper,
                ILogger<KPI_TieuChiChung_DiemSoController> logger,
                IKPI_DotTheoDoiDanhGiaService kPI_DotTheoDoiDanhGiaService,
                IKPI_LyLich2CService kPI_LyLich2CService,
                IKPI_TieuChiChungService kPI_TieuChiChungService
            )
        {
            _logger = logger;
            this._mapper = mapper;
            this._kPI_PhieuDanhGiaService = kPI_PhieuDanhGiaService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._kPI_TieuChiChung_DiemSoService = kPI_TieuChiChung_DiemSoService;
            this._kPI_DotTheoDoiDanhGiaService = kPI_DotTheoDoiDanhGiaService;
            this._kPI_LyLich2CService = kPI_LyLich2CService;
            this._kPI_TieuChiChungService = kPI_TieuChiChungService;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_TieuChiChung_DiemSo>> Create([FromBody] KPI_TieuChiChung_DiemSoCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_TieuChiChung_DiemSoCreateVM, KPI_TieuChiChung_DiemSo>(model);
                await _kPI_TieuChiChung_DiemSoService.CreateAsync(entity);
                return DataResponse<KPI_TieuChiChung_DiemSo>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_TieuChiChung_DiemSo");
                return DataResponse<KPI_TieuChiChung_DiemSo>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        /// <summary>
        /// API Lưu điểm tiêu chí chung - Luồng v1 (phiên bản cũ)
        /// </summary>
        [HttpPost("SaveScores")]
        public async Task<DataResponse<Guid>> SaveScores([FromBody] KPI_TieuChiChung_DiemSoSaveVM model)
        {
            try
            {
                if (model.IdLyLich == null || model.IdDotDanhGia == null)
                {
                    return DataResponse<Guid>.False("Thiếu thông tin người dùng hoặc đợt đánh giá.");
                }

                // 1. Cập nhật hoặc tạo mới PhieuDanhGia trước để lấy Id
                var phieuDanhGia = await _kPI_PhieuDanhGiaService
                    .GetQueryable()
                    .FirstOrDefaultAsync(x => x.IdLyLich == model.IdLyLich && x.IdDotDanhGia == model.IdDotDanhGia);

                Guid phieuId;

                if (phieuDanhGia != null)
                {
                    if (!string.IsNullOrEmpty(phieuDanhGia.TrangThai) && phieuDanhGia.TrangThai != TrangThaiPhieuConstant.KhoiTao && phieuDanhGia.TrangThai != TrangThaiPhieuConstant.TraVe)
                    {
                        return DataResponse<Guid>.False("Phiếu đánh giá đã bắt đầu luồng luân chuyển, không thể thao tác cập nhật.");
                    }

                    phieuDanhGia.UuDiem = model.UuDiem;
                    phieuDanhGia.HanChe = model.HanChe;
                    phieuDanhGia.YKienNhanXet = model.YKienNhanXet;
                    phieuDanhGia.DiemTieuChiChung = model.DiemTieuChiChung;
                    phieuDanhGia.TongDiem = model.TongDiem;
                    await _kPI_PhieuDanhGiaService.UpdateAsync(phieuDanhGia);
                    phieuId = phieuDanhGia.Id;
                }
                else
                {
                    phieuDanhGia = new KPI_PhieuDanhGia
                    {
                        IdLyLich = model.IdLyLich,
                        IdDotDanhGia = model.IdDotDanhGia,
                        UuDiem = model.UuDiem,
                        HanChe = model.HanChe,
                        YKienNhanXet = model.YKienNhanXet,
                        DiemTieuChiChung = model.DiemTieuChiChung,
                        TongDiem = model.TongDiem
                    };
                    await _kPI_PhieuDanhGiaService.CreateAsync(phieuDanhGia);
                    phieuId = phieuDanhGia.Id;
                }

                // 2. Cập nhật điểm và gán IdPhieuDanhGia
                var oldScores = _kPI_TieuChiChung_DiemSoService
                    .GetQueryable()
                    .Where(x => x.IdLyLich == model.IdLyLich && x.IdDotDanhGia == model.IdDotDanhGia)
                    .ToList();

                var newScores = new List<KPI_TieuChiChung_DiemSo>();
                var updateScores = new List<KPI_TieuChiChung_DiemSo>();

                if (model.Scores != null && model.Scores.Any())
                {
                    foreach (var score in model.Scores)
                    {
                        var existing = oldScores
                            .FirstOrDefault(x => x.IdTieuChiChung == score.IdTieuChiChung);
                        if (existing != null)
                        {
                            existing.DiemTuCham = score.DiemTuCham;
                            existing.IdPhieuDanhGia = phieuId;
                            updateScores.Add(existing);
                        }
                        else
                        {
                            newScores.Add(new KPI_TieuChiChung_DiemSo
                            {
                                IdTieuChiChung = score.IdTieuChiChung,
                                IdLyLich = model.IdLyLich,
                                IdDotDanhGia = model.IdDotDanhGia,
                                IdPhieuDanhGia = phieuId,
                                DiemTuCham = score.DiemTuCham
                            });
                        }
                    }

                    if (newScores.Any())
                    {
                        await _kPI_TieuChiChung_DiemSoService.CreateAsync(newScores);
                    }
                    if (updateScores.Any())
                    {
                        await _kPI_TieuChiChung_DiemSoService.UpdateAsync(updateScores);
                    }
                }

                return DataResponse<Guid>.Success(phieuId, "Lưu điểm thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu điểm KPI_TieuChiChung_DiemSo (v1)");
                return DataResponse<Guid>.False("Đã xảy ra lỗi khi lưu dữ liệu.");
            }
        }

        /// <summary>
        /// API Lưu điểm tiêu chí chung & đồng bộ phiếu - Luồng v2 (phiên bản mới / đa cấp)
        /// </summary>
        [HttpPost("SaveScoresV2")]
        public async Task<DataResponse<Guid>> SaveScoresV2([FromBody] KPI_TieuChiChung_DiemSoSaveV2VM model)
        {
            try
            {
                if (model == null)
                {
                    return DataResponse<Guid>.False("Dữ liệu gửi lên không hợp lệ.");
                }

                if (model.IdLyLich == null && model.IdPhieuDanhGia == null)
                {
                    return DataResponse<Guid>.False("Thiếu thông tin người dùng hoặc phiếu đánh giá.");
                }

                // 1. Tìm phiếu đánh giá theo IdPhieuDanhGia (nếu có) hoặc theo IdLyLich + IdDotDanhGia
                KPI_PhieuDanhGia phieuDanhGia = null;
                if (model.IdPhieuDanhGia.HasValue && model.IdPhieuDanhGia.Value != Guid.Empty)
                {
                    phieuDanhGia = await _kPI_PhieuDanhGiaService.GetByIdAsync(model.IdPhieuDanhGia.Value);
                }

                if (phieuDanhGia == null && model.IdLyLich.HasValue && model.IdDotDanhGia.HasValue)
                {
                    phieuDanhGia = await _kPI_PhieuDanhGiaService
                        .GetQueryable()
                        .FirstOrDefaultAsync(x => x.IdLyLich == model.IdLyLich && x.IdDotDanhGia == model.IdDotDanhGia);
                }

                if (phieuDanhGia != null
                    && !string.IsNullOrEmpty(phieuDanhGia.TrangThai)
                    && phieuDanhGia.TrangThai != TrangThaiPhieuConstant.KhoiTao
                    && phieuDanhGia.TrangThai != TrangThaiPhieuConstant.TraVe)
                {
                    return DataResponse<Guid>.False("Phiếu đánh giá đã bắt đầu luồng luân chuyển, không thể thao tác cập nhật.");
                }

                // Khi đã có phiếu, dùng thông tin trên phiếu làm nguồn chính xác
                // để tránh một payload không khớp làm áp dụng nhầm bộ tiêu chí.
                var idLyLichLuuDiem = phieuDanhGia?.IdLyLich ?? model.IdLyLich;
                var idDotDanhGiaLuuDiem = phieuDanhGia?.IdDotDanhGia ?? model.IdDotDanhGia;
                var validationMessage = await ValidateSelfScoreItemsAsync(
                    model.Scores,
                    idDotDanhGiaLuuDiem,
                    idLyLichLuuDiem,
                    phieuDanhGia?.Id);
                if (!string.IsNullOrEmpty(validationMessage))
                {
                    return DataResponse<Guid>.False(validationMessage);
                }

                Guid phieuId;

                if (phieuDanhGia != null)
                {
                    phieuDanhGia.UuDiem = model.UuDiem;
                    phieuDanhGia.HanChe = model.HanChe;
                    phieuDanhGia.YKienNhanXet = model.YKienNhanXet;
                    phieuDanhGia.DiemTieuChiChung = model.DiemTieuChiChung;
                    phieuDanhGia.DiemThucHienNhiemVu = model.DiemThucHienNhiemVu;
                    phieuDanhGia.TongDiem = model.TongDiem;
                    await _kPI_PhieuDanhGiaService.UpdateAsync(phieuDanhGia);
                    phieuId = phieuDanhGia.Id;
                }
                else
                {
                    phieuDanhGia = new KPI_PhieuDanhGia
                    {
                        IdLyLich = model.IdLyLich,
                        IdDotDanhGia = model.IdDotDanhGia,
                        UuDiem = model.UuDiem,
                        HanChe = model.HanChe,
                        YKienNhanXet = model.YKienNhanXet,
                        DiemTieuChiChung = model.DiemTieuChiChung,
                        DiemThucHienNhiemVu = model.DiemThucHienNhiemVu,
                        TongDiem = model.TongDiem
                    };
                    await _kPI_PhieuDanhGiaService.CreateAsync(phieuDanhGia);
                    phieuId = phieuDanhGia.Id;
                }

                // 2. Cập nhật điểm tiêu chí chung
                var queryScores = _kPI_TieuChiChung_DiemSoService.GetQueryable();
                if (idDotDanhGiaLuuDiem.HasValue && idLyLichLuuDiem.HasValue)
                {
                    queryScores = queryScores.Where(x => x.IdLyLich == idLyLichLuuDiem && x.IdDotDanhGia == idDotDanhGiaLuuDiem);
                }
                else
                {
                    queryScores = queryScores.Where(x => x.IdPhieuDanhGia == phieuId);
                }

                var oldScores = await queryScores.ToListAsync();
                var newScores = new List<KPI_TieuChiChung_DiemSo>();
                var updateScores = new List<KPI_TieuChiChung_DiemSo>();

                if (model.Scores != null && model.Scores.Any())
                {
                    foreach (var score in model.Scores)
                    {
                        var existing = oldScores
                            .FirstOrDefault(x => x.IdTieuChiChung == score.IdTieuChiChung);
                        if (existing != null)
                        {
                            existing.DiemTuCham = score.DiemTuCham;
                            existing.IdPhieuDanhGia = phieuId;
                            updateScores.Add(existing);
                        }
                        else
                        {
                            newScores.Add(new KPI_TieuChiChung_DiemSo
                            {
                                IdTieuChiChung = score.IdTieuChiChung,
                                IdLyLich = idLyLichLuuDiem,
                                IdDotDanhGia = idDotDanhGiaLuuDiem,
                                IdPhieuDanhGia = phieuId,
                                DiemTuCham = score.DiemTuCham
                            });
                        }
                    }

                    if (newScores.Any())
                    {
                        await _kPI_TieuChiChung_DiemSoService.CreateAsync(newScores);
                    }
                    if (updateScores.Any())
                    {
                        await _kPI_TieuChiChung_DiemSoService.UpdateAsync(updateScores);
                    }
                }

                return DataResponse<Guid>.Success(phieuId, "Lưu điểm thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu điểm KPI_TieuChiChung_DiemSo (v2)");
                return DataResponse<Guid>.False("Đã xảy ra lỗi khi lưu dữ liệu.");
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<KPI_TieuChiChung_DiemSo>> Update([FromBody] KPI_TieuChiChung_DiemSoEditVM model)
        {
            try
            {
                var entity = await _kPI_TieuChiChung_DiemSoService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_TieuChiChung_DiemSo>.False("KPI_TieuChiChung_DiemSo không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_TieuChiChung_DiemSoService.UpdateAsync(entity);
                return DataResponse<KPI_TieuChiChung_DiemSo>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_TieuChiChung_DiemSo với Id: {Id}", model.Id);
                return new DataResponse<KPI_TieuChiChung_DiemSo>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_TieuChiChung_DiemSoDto>> Get(Guid id)
        {
            var dto = await _kPI_TieuChiChung_DiemSoService.GetDto(id);
            return DataResponse<KPI_TieuChiChung_DiemSoDto>.Success(dto);
        }

        /// <summary>
        /// Lấy các phiếu của chính người dùng có thể kế thừa điểm tiêu chí chung.
        /// Không nhận IdLyLich từ client để tránh xem dữ liệu của người khác.
        /// </summary>
        [HttpGet("GetDanhSachKeThua")]
        public async Task<DataResponse<KPI_TieuChiChung_DiemSoKeThuaResponseDto>> GetDanhSachKeThua(
            [FromQuery] Guid idDotDanhGia)
        {
            if (!UserId.HasValue)
            {
                return DataResponse<KPI_TieuChiChung_DiemSoKeThuaResponseDto>.False(
                    "Không xác định được người dùng đăng nhập.");
            }

            try
            {
                var data = await _kPI_TieuChiChung_DiemSoService.GetDanhSachKeThua(
                    idDotDanhGia,
                    UserId.Value);
                return DataResponse<KPI_TieuChiChung_DiemSoKeThuaResponseDto>.Success(data);
            }
            catch (InvalidOperationException ex)
            {
                return DataResponse<KPI_TieuChiChung_DiemSoKeThuaResponseDto>.False(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách kế thừa điểm tiêu chí chung cho đợt {IdDotDanhGia}", idDotDanhGia);
                return DataResponse<KPI_TieuChiChung_DiemSoKeThuaResponseDto>.False(
                    "Đã xảy ra lỗi khi lấy danh sách kế thừa điểm.");
            }
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_TieuChiChung_DiemSoDto>>> GetData([FromBody] KPI_TieuChiChung_DiemSoSearch search)
        {
            var data = await _kPI_TieuChiChung_DiemSoService.GetData(search);
            return DataResponse<PagedList<KPI_TieuChiChung_DiemSoDto>>.Success(data);
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_TieuChiChung_DiemSoService.GetByIdAsync(id);
                await _kPI_TieuChiChung_DiemSoService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_TieuChiChung_DiemSo với Id: {Id}", id);
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


        [HttpGet("export")]
        public async Task<DataResponse> ExportExcel()
        {
            try
            {
                var search = new KPI_TieuChiChung_DiemSoSearch();
                var data = await _kPI_TieuChiChung_DiemSoService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_TieuChiChung_DiemSoDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_TieuChiChung_DiemSo");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_TieuChiChung_DiemSo>(rootPath, "KPI_TieuChiChung_DiemSo");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_TieuChiChung_DiemSo>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_TieuChiChung_DiemSo>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_TieuChiChung_DiemSo>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_TieuChiChung_DiemSo>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_TieuChiChung_DiemSoService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_TieuChiChung_DiemSo>();


                response.ListTrue = listImportReponse;
                response.lstFalse = rsl.lstFalse;

                return DataResponse.Success(response);
            }
            catch (Exception)
            {
                return DataResponse.False("Import thất bại");
            }
        }

        [HttpPost("GetTongHopTieuChi")]
        public async Task<DataResponse<KPI_TongHopTieuChiChungDto>> GetTongHopTieuChi([FromBody] KPI_TongHopTieuChiChungSearchDto search)
        {
            if (string.IsNullOrEmpty(search.Type))
            {
                search.Type = "Thang";
            }

            // Nếu chưa chọn Đợt (khi xem Tháng) hoặc chưa chọn Quý/Năm (khi xem Quý)
            var dotGanNhat = await _kPI_DotTheoDoiDanhGiaService.GetQueryable()
                .OrderByDescending(x => x.Nam)
                .ThenByDescending(x => x.Thang)
                .ThenByDescending(x => x.CreatedDate)
                .FirstOrDefaultAsync();

            if (search.Type == "Thang")
            {
                if (!search.IdDot.HasValue || search.IdDot == Guid.Empty)
                {
                    if (dotGanNhat != null)
                    {
                        search.IdDot = dotGanNhat.Id;
                    }
                }
            }
            else if (search.Type == "Quy")
            {
                if (!search.Quy.HasValue || !search.Nam.HasValue)
                {
                    if (dotGanNhat != null)
                    {
                        search.Quy = search.Quy ?? (dotGanNhat.Quy ?? ((dotGanNhat.Thang - 1) / 3 + 1));
                        search.Nam = search.Nam ?? (dotGanNhat.Nam ?? DateTime.Now.Year);
                    }
                    else
                    {
                        search.Quy = search.Quy ?? ((DateTime.Now.Month - 1) / 3 + 1);
                        search.Nam = search.Nam ?? DateTime.Now.Year;
                    }
                }
            }

            // Nếu chưa chọn Phòng ban -> chuyển thông tin CurrentUserId sang Service xử lý
            if (UserId.HasValue)
            {
                search.CurrentUserId = UserId.Value;
            }

            var data = await _kPI_TieuChiChung_DiemSoService.GetTongHopTieuChi(search);
            return DataResponse<KPI_TongHopTieuChiChungDto>.Success(data);
        }

        [HttpPost("GetTongHopToanCuc")]
        public async Task<DataResponse<KPI_TongHopToanCucDto>> GetTongHopToanCuc([FromBody] KPI_TongHopTieuChiChungSearchDto search)
        {
            if (string.IsNullOrEmpty(search.Type))
            {
                search.Type = "Thang";
            }

            var dotGanNhat = await _kPI_DotTheoDoiDanhGiaService.GetQueryable()
                .OrderByDescending(x => x.Nam)
                .ThenByDescending(x => x.Thang)
                .ThenByDescending(x => x.CreatedDate)
                .FirstOrDefaultAsync();

            if (search.Type == "Thang")
            {
                if (!search.IdDot.HasValue || search.IdDot == Guid.Empty)
                {
                    if (dotGanNhat != null)
                    {
                        search.IdDot = dotGanNhat.Id;
                    }
                }
            }
            else if (search.Type == "Quy")
            {
                if (!search.Quy.HasValue || !search.Nam.HasValue)
                {
                    if (dotGanNhat != null)
                    {
                        search.Quy = search.Quy ?? (dotGanNhat.Quy ?? ((dotGanNhat.Thang - 1) / 3 + 1));
                        search.Nam = search.Nam ?? (dotGanNhat.Nam ?? DateTime.Now.Year);
                    }
                    else
                    {
                        search.Quy = search.Quy ?? ((DateTime.Now.Month - 1) / 3 + 1);
                        search.Nam = search.Nam ?? DateTime.Now.Year;
                    }
                }
            }

            // Nếu chưa chọn Đơn vị sử dụng -> lấy mặc định từ UserId của user đang đăng nhập
            if (!search.DonViSuDungId.HasValue || search.DonViSuDungId == Guid.Empty)
            {
                if (UserId.HasValue)
                {
                    var lyLich = await _kPI_LyLich2CService.GetQueryable()
                        .FirstOrDefaultAsync(x => x.UserId == UserId.Value);
                    if (lyLich != null && lyLich.DonViSuDungId != Guid.Empty)
                    {
                        search.DonViSuDungId = lyLich.DonViSuDungId;
                    }
                }
            }

            var data = await _kPI_TieuChiChung_DiemSoService.GetTongHopToanCuc(search);
            return DataResponse<KPI_TongHopToanCucDto>.Success(data);
        }

        [HttpGet("GetChartThongKeQuyToanCuc")]
        public async Task<DataResponse<List<KPI_ThongKeQuyDonViDto>>> GetChartThongKeQuyToanCuc([FromQuery] int quy, [FromQuery] int nam, [FromQuery] Guid? donViSuDungId = null)
        {
            var targetDonViId = donViSuDungId;
            if (!targetDonViId.HasValue || targetDonViId == Guid.Empty)
            {
                if (UserId.HasValue)
                {
                    var lyLich = await _kPI_LyLich2CService.GetQueryable()
                        .FirstOrDefaultAsync(x => x.UserId == UserId.Value);
                    if (lyLich != null && lyLich.DonViSuDungId != Guid.Empty)
                    {
                        targetDonViId = lyLich.DonViSuDungId;
                    }
                }
            }

            var data = await _kPI_TieuChiChung_DiemSoService.GetChartThongKeQuyToanCuc(quy, nam, targetDonViId, UserId);
            return DataResponse<List<KPI_ThongKeQuyDonViDto>>.Success(data);
        }

        /// <summary>
        /// Chỉ cho phép lưu điểm tự chấm cho các tiêu chí lá của đúng bộ tiêu chí
        /// đang áp dụng cho phiếu. Dữ liệu điểm cũ ngoài tập này được giữ nguyên
        /// để không thay đổi lịch sử; chúng chỉ không thể được tạo/cập nhật lại.
        /// </summary>
        private async Task<string?> ValidateSelfScoreItemsAsync(
            IEnumerable<ScoreItem>? scoreItems,
            Guid? idDotDanhGia,
            Guid? idLyLich,
            Guid? idPhieuDanhGia)
        {
            var items = scoreItems?.ToList() ?? new List<ScoreItem>();
            if (items.Count == 0)
            {
                return null;
            }

            if (!idDotDanhGia.HasValue || idDotDanhGia.Value == Guid.Empty
                || !idLyLich.HasValue || idLyLich.Value == Guid.Empty)
            {
                return "Không xác định được đợt đánh giá hoặc hồ sơ để kiểm tra tiêu chí chấm điểm.";
            }

            if (items.Any(x => x.IdTieuChiChung == Guid.Empty))
            {
                return "Danh sách điểm có tiêu chí không hợp lệ.";
            }

            if (items.GroupBy(x => x.IdTieuChiChung).Any(group => group.Count() > 1))
            {
                return "Danh sách điểm có tiêu chí bị trùng.";
            }

            var boTieuChi = await _kPI_TieuChiChungService.GetBoTieuChiChungApDungForDot(
                idDotDanhGia.Value,
                idLyLich,
                idPhieuDanhGia);
            if (boTieuChi == null)
            {
                return "Không xác định được bộ tiêu chí chung áp dụng cho phiếu đánh giá.";
            }

            var tree = await _kPI_TieuChiChungService.GetTreeDataForBoTieuChiChung(
                boTieuChi.IdBoTieuChiChung);
            var leafCriterionIds = new HashSet<Guid>();
            CollectLeafCriterionIds(tree, leafCriterionIds);

            if (leafCriterionIds.Count == 0)
            {
                return "Bộ tiêu chí chung áp dụng chưa có tiêu chí lá để chấm điểm.";
            }

            if (items.Any(x => !leafCriterionIds.Contains(x.IdTieuChiChung)))
            {
                return "Chỉ được lưu điểm cho các tiêu chí lá thuộc bộ tiêu chí chung áp dụng.";
            }

            return null;
        }

        private static void CollectLeafCriterionIds(
            IEnumerable<KPI_TieuChiChungTreeDto> nodes,
            ISet<Guid> leafCriterionIds)
        {
            foreach (var node in nodes)
            {
                if (node.Children == null || node.Children.Count == 0)
                {
                    leafCriterionIds.Add(node.Id);
                    continue;
                }

                CollectLeafCriterionIds(node.Children, leafCriterionIds);
            }
        }
    }
}
