using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hinet.Model;
using Hinet.Model.Entities;
using Hinet.Service.KPI_NhiemVuService;
using Hinet.Service.KPI_NhiemVuService.Dto;
using Hinet.Service.KPI_DauRaNhiemVuService;
using Hinet.Service.KPI_KetQuaThucHienNhiemVuService;
using Hinet.Service.KPI_KetQuaThucHienNhiemVuService.Dto;
using Hinet.Service.KPI_NhiemVuService.ViewModels;
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


namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_NhiemVuController : HinetController
    {
        private readonly IKPI_NhiemVuService _kPI_NhiemVuService;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IKPI_DauRaNhiemVuService _kPI_DauRaNhiemVuService;
        private readonly IKPI_KetQuaThucHienNhiemVuService _kPI_KetQuaThucHienNhiemVuService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_NhiemVuController> _logger;

        public KPI_NhiemVuController(
            IKPI_NhiemVuService kPI_NhiemVuService,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IKPI_DauRaNhiemVuService kPI_DauRaNhiemVuService,
            IKPI_KetQuaThucHienNhiemVuService kPI_KetQuaThucHienNhiemVuService,
            IMapper mapper,
            ILogger<KPI_NhiemVuController> logger
            )
        {
            this._kPI_NhiemVuService = kPI_NhiemVuService;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._kPI_DauRaNhiemVuService = kPI_DauRaNhiemVuService;
            this._kPI_KetQuaThucHienNhiemVuService = kPI_KetQuaThucHienNhiemVuService;
            this._mapper = mapper;
            _logger = logger;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_NhiemVu>> Create([FromBody] KPI_NhiemVuCreateVM model)
        {
            try
            {
                var entity = _mapper.Map<KPI_NhiemVuCreateVM, KPI_NhiemVu>(model);
                await _kPI_NhiemVuService.CreateAsync(entity);
                return DataResponse<KPI_NhiemVu>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_NhiemVu");
                return DataResponse<KPI_NhiemVu>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }



        [HttpPut("Update")]
        public async Task<DataResponse<KPI_NhiemVu>> Update([FromBody] KPI_NhiemVuEditVM model)
        {
            try
            {
                var entity = await _kPI_NhiemVuService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_NhiemVu>.False("KPI_NhiemVu không tồn tại");

                entity = _mapper.Map(model, entity);
                await _kPI_NhiemVuService.UpdateAsync(entity);
                return DataResponse<KPI_NhiemVu>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_NhiemVu với Id: {Id}", model.Id);
                return new DataResponse<KPI_NhiemVu>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_NhiemVuDto>> Get(Guid id)
        {
            var dto = await _kPI_NhiemVuService.GetDto(id);
            return DataResponse<KPI_NhiemVuDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_NhiemVuDto>>> GetData([FromBody] KPI_NhiemVuSearch search)
        {
            var data = await _kPI_NhiemVuService.GetData(search);
            return DataResponse<PagedList<KPI_NhiemVuDto>>.Success(data);
        }

        [HttpGet("GetNhiemVuByTypeAndLyLich")]
        public async Task<DataResponse<List<KPI_NhiemVuDto>>> GetNhiemVuByTypeAndLyLich([FromQuery] Guid idLyLich, [FromQuery] string type, [FromQuery] Guid idDotTheoDoiDanhGia)
        {
            var data = await _kPI_NhiemVuService.GetListByTypeAndLyLich(idLyLich, type, idDotTheoDoiDanhGia);
            return DataResponse<List<KPI_NhiemVuDto>>.Success(data);
        }

        [HttpGet("GetChiTietNhiemVuThang")]
        public async Task<DataResponse<object>> GetChiTietNhiemVuThang([FromQuery] Guid idLyLich, [FromQuery] Guid idDotDanhGia)
        {
            try
            {
                var dataHethong = await _kPI_NhiemVuService.GetListByTypeAndLyLich(idLyLich, "HETHONG", idDotDanhGia);
                var dataPhatSinh = await _kPI_NhiemVuService.GetListByTypeAndLyLich(idLyLich, "PHATSINH", idDotDanhGia);

                var mapTask = new Func<KPI_NhiemVuDto, object>(t => new
                {
                    Id = t.Id,
                    MieuTa = !string.IsNullOrEmpty(t.TenNhiemVuDayDu) ? t.TenNhiemVuDayDu : t.TenNhiemVuRutGon,
                    DiemBoTieuChi = t.DiemTheoBoTieuChi,
                    SanPham = t.DanhSachDauRa?.Select(p => new
                    {
                        Id = p.Id,
                        TenSanPham = p.TenSanPhamDauRa,
                        TenTieuChi = !string.IsNullOrEmpty(p.TenTieuChi) ? p.TenTieuChi : p.TieuChiId.ToString(),
                        DiemBoTieuChi = p.DiemTheoBoTieuChi
                    }).ToList()
                });

                var result = new
                {
                    HeThong = dataHethong?.Select(mapTask).ToList() ?? new List<object>(),
                    PhatSinh = dataPhatSinh?.Select(mapTask).ToList() ?? new List<object>()
                };

                return DataResponse<object>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy chi tiết nhiệm vụ tháng");
                return DataResponse<object>.False("Lỗi khi lấy dữ liệu");
            }
        }

        [HttpPost("CreatePhatSinhBulk")]
        public async Task<DataResponse> CreatePhatSinhBulk([FromBody] List<KPI_NhiemVuPhatSinhCreateDto> model)
        {
            try
            {
                foreach (var item in model)
                {
                    if (item.Id.HasValue && item.Id.Value != Guid.Empty)
                    {
                        var nv = await _kPI_NhiemVuService.GetByIdAsync(item.Id.Value);
                        if (nv != null)
                        {
                            nv.TenNhiemVuDayDu = item.TenNhiemVuDayDu;
                            nv.IdLyLich = item.IdLyLich;
                            nv.IdDotTheoDoiDanhGia = item.IdDotTheoDoiDanhGia;
                            nv.IdPhieuDanhGia = item.IdPhieuDanhGia;
                            await _kPI_NhiemVuService.UpdateAsync(nv);

                            if (item.DanhSachDauRa != null && item.DanhSachDauRa.Any())
                            {
                                foreach (var sp in item.DanhSachDauRa)
                                {
                                    if (sp.Id.HasValue && sp.Id.Value != Guid.Empty)
                                    {
                                        var dauRa = await _kPI_DauRaNhiemVuService.GetByIdAsync(sp.Id.Value);
                                        if (dauRa != null)
                                        {
                                            dauRa.TenSanPhamDauRa = sp.TenSanPhamDauRa;
                                            dauRa.TieuChiId = sp.TieuChiId;
                                            dauRa.DiemTheoBoTieuChi = sp.DiemTheoBoTieuChi;
                                            dauRa.ChamDiemSoLuong_HoanThanh = sp.ChamDiemSoLuong_HoanThanh;
                                            dauRa.ChamDiemSoLuong_KhongHoanThanh = sp.ChamDiemSoLuong_KhongHoanThanh;
                                            dauRa.ChamDiemSoLuong_Diem = sp.ChamDiemSoLuong_Diem;
                                            dauRa.ChamDiemChatLuong_KhongDat = sp.ChamDiemChatLuong_KhongDat;
                                            dauRa.ChamDiemChatLuong_SoDiemConLai = sp.ChamDiemChatLuong_SoDiemConLai;
                                            dauRa.ChamDiemChatLuong_Diem = sp.ChamDiemChatLuong_Diem;
                                            dauRa.ChamDiemTienDo_KhongDat = sp.ChamDiemTienDo_KhongDat;
                                            dauRa.ChamDiemTienDo_SoDiemConLai = sp.ChamDiemTienDo_SoDiemConLai;
                                            dauRa.ChamDiemTienDo_Diem = sp.ChamDiemTienDo_Diem;
                                            dauRa.GhiChuGiaTrinh = sp.GhiChuGiaTrinh;
                                            await _kPI_DauRaNhiemVuService.UpdateAsync(dauRa);
                                        }
                                    }
                                    else
                                    {
                                        var dauRa = new KPI_DauRaNhiemVu()
                                        {
                                            IdNhiemVu = nv.Id,
                                            IdDotDanhGia = nv.IdDotTheoDoiDanhGia,
                                            TenSanPhamDauRa = sp.TenSanPhamDauRa,
                                            TieuChiId = sp.TieuChiId,
                                            DiemTheoBoTieuChi = sp.DiemTheoBoTieuChi,
                                            ChamDiemSoLuong_HoanThanh = sp.ChamDiemSoLuong_HoanThanh,
                                            ChamDiemSoLuong_KhongHoanThanh = sp.ChamDiemSoLuong_KhongHoanThanh,
                                            ChamDiemSoLuong_Diem = sp.ChamDiemSoLuong_Diem,
                                            ChamDiemChatLuong_KhongDat = sp.ChamDiemChatLuong_KhongDat,
                                            ChamDiemChatLuong_SoDiemConLai = sp.ChamDiemChatLuong_SoDiemConLai,
                                            ChamDiemChatLuong_Diem = sp.ChamDiemChatLuong_Diem,
                                            ChamDiemTienDo_KhongDat = sp.ChamDiemTienDo_KhongDat,
                                            ChamDiemTienDo_SoDiemConLai = sp.ChamDiemTienDo_SoDiemConLai,
                                            ChamDiemTienDo_Diem = sp.ChamDiemTienDo_Diem,
                                            GhiChuGiaTrinh = sp.GhiChuGiaTrinh,
                                            CreatedDate = DateTime.Now
                                        };
                                        await _kPI_DauRaNhiemVuService.CreateAsync(dauRa);
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        var nv = new KPI_NhiemVu()
                        {
                            TenNhiemVuDayDu = item.TenNhiemVuDayDu,
                            IdLyLich = item.IdLyLich,
                            IdDotTheoDoiDanhGia = item.IdDotTheoDoiDanhGia,
                            IdPhieuDanhGia = item.IdPhieuDanhGia,
                            Type = !string.IsNullOrEmpty(item.TypeNhiemVu) ? item.TypeNhiemVu : "PHATSINH",
                            CreatedDate = DateTime.Now
                        };
                        await _kPI_NhiemVuService.CreateAsync(nv);

                        if (item.DanhSachDauRa != null && item.DanhSachDauRa.Any())
                        {
                            foreach (var sp in item.DanhSachDauRa)
                            {
                                var dauRa = new KPI_DauRaNhiemVu()
                                {
                                    IdNhiemVu = nv.Id,
                                    IdDotDanhGia = nv.IdDotTheoDoiDanhGia,
                                    TenSanPhamDauRa = sp.TenSanPhamDauRa,
                                    TieuChiId = sp.TieuChiId,
                                    DiemTheoBoTieuChi = sp.DiemTheoBoTieuChi,
                                    ChamDiemSoLuong_HoanThanh = sp.ChamDiemSoLuong_HoanThanh,
                                    ChamDiemSoLuong_KhongHoanThanh = sp.ChamDiemSoLuong_KhongHoanThanh,
                                    ChamDiemSoLuong_Diem = sp.ChamDiemSoLuong_Diem,
                                    ChamDiemChatLuong_KhongDat = sp.ChamDiemChatLuong_KhongDat,
                                    ChamDiemChatLuong_SoDiemConLai = sp.ChamDiemChatLuong_SoDiemConLai,
                                    ChamDiemChatLuong_Diem = sp.ChamDiemChatLuong_Diem,
                                    ChamDiemTienDo_KhongDat = sp.ChamDiemTienDo_KhongDat,
                                    ChamDiemTienDo_SoDiemConLai = sp.ChamDiemTienDo_SoDiemConLai,
                                    ChamDiemTienDo_Diem = sp.ChamDiemTienDo_Diem,
                                    GhiChuGiaTrinh = sp.GhiChuGiaTrinh,
                                    CreatedDate = DateTime.Now
                                };
                                await _kPI_DauRaNhiemVuService.CreateAsync(dauRa);
                            }
                        }
                    }
                }
                return DataResponse.Success("Thêm mới nhiệm vụ phát sinh thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo danh sách nhiệm vụ phát sinh");
                return DataResponse.False("Đã xảy ra lỗi khi lưu dữ liệu.");
            }
        }

        [HttpPost("SaveWithAttachments")]
        [RequestSizeLimit(220L * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 220L * 1024 * 1024)]
        public async Task<DataResponse<KPI_NhiemVuSaveWithAttachmentsResponse>> SaveWithAttachments(
            [FromForm] KPI_NhiemVuSaveWithAttachmentsRequest request)
        {
            try
            {
                var result = await _kPI_NhiemVuService.SaveWithAttachmentsAsync(request, UserId);
                return DataResponse<KPI_NhiemVuSaveWithAttachmentsResponse>.Success(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Dữ liệu tài liệu KPI không hợp lệ");
                return DataResponse<KPI_NhiemVuSaveWithAttachmentsResponse>.False(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Từ chối lưu tài liệu KPI");
                return DataResponse<KPI_NhiemVuSaveWithAttachmentsResponse>.False(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu nhiệm vụ và tài liệu KPI");
                return DataResponse<KPI_NhiemVuSaveWithAttachmentsResponse>.False("Đã xảy ra lỗi khi lưu nhiệm vụ và tài liệu.");
            }
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                await _kPI_NhiemVuService.DeleteWithAttachmentsAsync(id, UserId);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_NhiemVu với Id: {Id}", id);
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
                var search = new KPI_NhiemVuSearch();
                var data = await _kPI_NhiemVuService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_NhiemVuDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_NhiemVu");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_NhiemVu>(rootPath, "KPI_NhiemVu");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_NhiemVu>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_NhiemVu>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_NhiemVu>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_NhiemVu>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_NhiemVuService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_NhiemVu>();


                response.ListTrue = listImportReponse;
                response.lstFalse = rsl.lstFalse;

                return DataResponse.Success(response);
            }
            catch (Exception)
            {
                return DataResponse.False("Import thất bại");
            }
        }
        [HttpPost("SaveKetQuaThucHien")]
        public async Task<DataResponse> SaveKetQuaThucHien([FromBody] SaveKetQuaThucHienNhiemVuDto model)
        {
            try
            {
                await _kPI_KetQuaThucHienNhiemVuService.SaveKetQuaThucHien(model);
                return DataResponse.Success("Thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu kết quả thực hiện nhiệm vụ");
                return DataResponse.False("Lỗi khi lưu kết quả");
            }
        }

        [HttpGet("GetKetQuaThucHien")]
        public async Task<DataResponse<KPI_KetQuaThucHienNhiemVu?>> GetKetQuaThucHien([FromQuery] Guid? idPhieuDanhGia, [FromQuery] Guid? idDotDanhGia, [FromQuery] Guid? idLyLich)
        {
            try
            {
                var result = await _kPI_KetQuaThucHienNhiemVuService.GetKetQuaThucHien(idPhieuDanhGia, idDotDanhGia, idLyLich);
                return DataResponse<KPI_KetQuaThucHienNhiemVu?>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy kết quả thực hiện nhiệm vụ");
                return DataResponse<KPI_KetQuaThucHienNhiemVu?>.False("Lỗi khi lấy dữ liệu");
            }
        }

        [HttpGet("GetHeSoLanhDaoApDung")]
        public async Task<DataResponse<HeSoLanhDaoApDungDto>> GetHeSoLanhDaoApDung([FromQuery] Guid? idPhieuDanhGia, [FromQuery] Guid? idDotDanhGia, [FromQuery] Guid? idLyLich)
        {
            try
            {
                var result = await _kPI_KetQuaThucHienNhiemVuService.GetHeSoLanhDaoApDung(idPhieuDanhGia, idDotDanhGia, idLyLich);
                return DataResponse<HeSoLanhDaoApDungDto>.Success(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy hệ số lãnh đạo áp dụng");
                return DataResponse<HeSoLanhDaoApDungDto>.False(ex.Message);
            }
        }

        [HttpPost("RecalculateAllNegativeScores")]
        public async Task<DataResponse> RecalculateAllNegativeScores([FromServices] HinetContext dbContext)
        {
            try
            {
                var connection = dbContext.Database.GetDbConnection();
                bool connectionWasClosed = connection.State == System.Data.ConnectionState.Closed;
                if (connectionWasClosed)
                    await connection.OpenAsync();

                try
                {
                    using var command = connection.CreateCommand();
                    command.CommandText = @"
                        UPDATE ""KPI_DauRaNhiemVu""
                        SET 
                            ""ChamDiemSoLuong_Diem"" = CASE WHEN ""ChamDiemSoLuong_Diem"" < 0 THEN 0 ELSE ""ChamDiemSoLuong_Diem"" END,
                            ""ChamDiemChatLuong_SoDiemConLai"" = CASE WHEN ""ChamDiemChatLuong_SoDiemConLai"" < 0 THEN 0 ELSE ""ChamDiemChatLuong_SoDiemConLai"" END,
                            ""ChamDiemChatLuong_Diem"" = CASE WHEN ""ChamDiemChatLuong_Diem"" < 0 THEN 0 ELSE ""ChamDiemChatLuong_Diem"" END,
                            ""ChamDiemTienDo_SoDiemConLai"" = CASE WHEN ""ChamDiemTienDo_SoDiemConLai"" < 0 THEN 0 ELSE ""ChamDiemTienDo_SoDiemConLai"" END,
                            ""ChamDiemTienDo_Diem"" = CASE WHEN ""ChamDiemTienDo_Diem"" < 0 THEN 0 ELSE ""ChamDiemTienDo_Diem"" END
                        WHERE 
                            ""ChamDiemSoLuong_Diem"" < 0 OR
                            ""ChamDiemChatLuong_SoDiemConLai"" < 0 OR
                            ""ChamDiemChatLuong_Diem"" < 0 OR
                            ""ChamDiemTienDo_SoDiemConLai"" < 0 OR
                            ""ChamDiemTienDo_Diem"" < 0;

                        UPDATE ""KPI_NhiemVu""
                        SET 
                            ""ChamDiemSoLuong_Diem"" = CASE WHEN ""ChamDiemSoLuong_Diem"" < 0 THEN 0 ELSE ""ChamDiemSoLuong_Diem"" END,
                            ""ChamDiemChatLuong_SoDiemConLai"" = CASE WHEN ""ChamDiemChatLuong_SoDiemConLai"" < 0 THEN 0 ELSE ""ChamDiemChatLuong_SoDiemConLai"" END,
                            ""ChamDiemChatLuong_Diem"" = CASE WHEN ""ChamDiemChatLuong_Diem"" < 0 THEN 0 ELSE ""ChamDiemChatLuong_Diem"" END,
                            ""ChamDiemTienDo_SoDiemConLai"" = CASE WHEN ""ChamDiemTienDo_SoDiemConLai"" < 0 THEN 0 ELSE ""ChamDiemTienDo_SoDiemConLai"" END,
                            ""ChamDiemTienDo_Diem"" = CASE WHEN ""ChamDiemTienDo_Diem"" < 0 THEN 0 ELSE ""ChamDiemTienDo_Diem"" END
                        WHERE 
                            ""ChamDiemSoLuong_Diem"" < 0 OR
                            ""ChamDiemChatLuong_SoDiemConLai"" < 0 OR
                            ""ChamDiemChatLuong_Diem"" < 0 OR
                            ""ChamDiemTienDo_SoDiemConLai"" < 0 OR
                            ""ChamDiemTienDo_Diem"" < 0;

                        UPDATE ""KPI_PhieuDanhGia""
                        SET 
                            ""DiemTieuChiChung"" = CASE WHEN ""DiemTieuChiChung"" < 0 THEN 0 ELSE ""DiemTieuChiChung"" END,
                            ""DiemThucHienNhiemVu"" = CASE WHEN ""DiemThucHienNhiemVu"" < 0 THEN 0 ELSE ""DiemThucHienNhiemVu"" END,
                            ""TongDiem"" = CASE WHEN ""TongDiem"" < 0 THEN 0 ELSE ""TongDiem"" END
                        WHERE 
                            ""DiemTieuChiChung"" < 0 OR
                            ""DiemThucHienNhiemVu"" < 0 OR
                            ""TongDiem"" < 0;
                    ";

                    int affected = await command.ExecuteNonQueryAsync();
                    return DataResponse.Success($"Đã tái tính toán và cập nhật thành công {affected} hàng dữ liệu!");
                }
                finally
                {
                    if (connectionWasClosed)
                        await connection.CloseAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tái tính toán điểm âm trong CSDL");
                return DataResponse.False("Đã xảy ra lỗi khi tái tính toán: " + ex.Message);
            }
        }


        
        [HttpPost("SaveNhiemVuTCCB")]
        public async Task<DataResponse> SaveNhiemVuTCCB([FromBody] SaveNhiemVuTCCBVM model)
        {
            try
            {
                var userId = UserId;
                var task = await _kPI_NhiemVuService.SaveNhiemVuTCCBAsync(model, userId);
                return DataResponse.Success(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu nhiệm vụ");
                return DataResponse.False("Lỗi khi lưu nhiệm vụ: " + ex.Message);
            }
        }

        [HttpDelete("DeleteNhiemVuTCCB/{id}")]
        public async Task<DataResponse> DeleteNhiemVuTCCB(Guid id)
        {
            try
            {
                var userId = UserId;
                await _kPI_NhiemVuService.DeleteNhiemVuTCCBAsync(id, userId);
                return DataResponse.Success("Xóa thành công");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa nhiệm vụ");
                return DataResponse.False("Lỗi khi xóa nhiệm vụ: " + ex.Message);
            }
        }

    }
}
