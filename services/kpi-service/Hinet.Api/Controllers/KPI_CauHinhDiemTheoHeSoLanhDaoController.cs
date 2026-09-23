using Hinet.Service.Core.Mapper;
using Microsoft.AspNetCore.Mvc;
using Hinet.Model.Entities;
using Hinet.Service.KPI_CauHinhDiemTheoHeSoLanhDaoService;
using Hinet.Service.KPI_CauHinhDiemTheoHeSoLanhDaoService.Dto;
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
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.IO;
using Hinet.Api.Controllers;
using System.Linq;
using Microsoft.EntityFrameworkCore;

using Hinet.Service.KPI_BoTieuChiDonViService;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_CauHinhDiemTheoHeSoLanhDaoController : HinetController
    {
        private readonly IKPI_CauHinhDiemTheoHeSoLanhDaoService _kPI_CauHinhDiemTheoHeSoLanhDaoService;
        private readonly IMapper _mapper;
        private readonly ILogger<KPI_CauHinhDiemTheoHeSoLanhDaoController> _logger;
        private readonly IKPI_BoTieuChiDonViService _kPI_BoTieuChiDonViService;

        public KPI_CauHinhDiemTheoHeSoLanhDaoController(
            IKPI_CauHinhDiemTheoHeSoLanhDaoService kPI_CauHinhDiemTheoHeSoLanhDaoService,
            IMapper mapper,
            ILogger<KPI_CauHinhDiemTheoHeSoLanhDaoController> logger,
            IKPI_BoTieuChiDonViService kPI_BoTieuChiDonViService
            )
        {
            this._kPI_CauHinhDiemTheoHeSoLanhDaoService = kPI_CauHinhDiemTheoHeSoLanhDaoService;
            this._mapper = mapper;
            _logger = logger;
            _kPI_BoTieuChiDonViService = kPI_BoTieuChiDonViService;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_CauHinhDiemTheoHeSoLanhDao>> Create([FromBody] KPI_CauHinhDiemTheoHeSoLanhDaoDto model)
        {
            try
            {
                var entity = new KPI_CauHinhDiemTheoHeSoLanhDao()
                {
                    Id = Guid.NewGuid(),
                    ChucVu = model.ChucVu,
                    HeSo = model.HeSo,
                    CreatedDate = DateTime.Now
                };
                await _kPI_CauHinhDiemTheoHeSoLanhDaoService.CreateAsync(entity);
                return DataResponse<KPI_CauHinhDiemTheoHeSoLanhDao>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_CauHinhDiemTheoHeSoLanhDao");
                return DataResponse<KPI_CauHinhDiemTheoHeSoLanhDao>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }

        [HttpPut("Update")]
        public async Task<DataResponse<KPI_CauHinhDiemTheoHeSoLanhDao>> Update([FromBody] KPI_CauHinhDiemTheoHeSoLanhDaoDto model)
        {
            try
            {
                var entity = await _kPI_CauHinhDiemTheoHeSoLanhDaoService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_CauHinhDiemTheoHeSoLanhDao>.False("Bản ghi không tồn tại");

                entity.ChucVu = model.ChucVu;
                entity.HeSo = model.HeSo;
                entity.UpdatedDate = DateTime.Now;

                await _kPI_CauHinhDiemTheoHeSoLanhDaoService.UpdateAsync(entity);
                return DataResponse<KPI_CauHinhDiemTheoHeSoLanhDao>.Success(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_CauHinhDiemTheoHeSoLanhDao với Id: {Id}", model.Id);
                return new DataResponse<KPI_CauHinhDiemTheoHeSoLanhDao>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpPost("SaveList")]
        public async Task<DataResponse> SaveList([FromBody] List<KPI_CauHinhDiemTheoHeSoLanhDaoDto> listData, [FromQuery] Guid idBoTieuChi)
        {
            try
            {
                var search = new KPI_CauHinhDiemTheoHeSoLanhDaoSearch() { IdBoTieuChi = idBoTieuChi };
                var oldData = await _kPI_CauHinhDiemTheoHeSoLanhDaoService.GetData(search);
                if(oldData?.Items != null && oldData.Items.Any())
                {
                    foreach(var item in oldData.Items)
                    {
                        var e = await _kPI_CauHinhDiemTheoHeSoLanhDaoService.GetByIdAsync(item.Id);
                        if(e != null) {
                            await _kPI_CauHinhDiemTheoHeSoLanhDaoService.DeleteAsync(e);
                        }
                    }
                }

                if (listData != null && listData.Any())
                {
                    foreach (var model in listData)
                    {
                        var entity = new KPI_CauHinhDiemTheoHeSoLanhDao()
                        {
                            Id = Guid.NewGuid(),
                            ChucVu = model.ChucVu,
                            HeSo = model.HeSo,
                            IdBoTieuChi = idBoTieuChi,
                            CreatedDate = DateTime.Now
                        };
                        await _kPI_CauHinhDiemTheoHeSoLanhDaoService.CreateAsync(entity);
                    }
                }
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lưu list KPI_CauHinhDiemTheoHeSoLanhDao");
                return DataResponse.False("Đã xảy ra lỗi khi cập nhật dữ liệu.");
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_CauHinhDiemTheoHeSoLanhDaoDto>> Get(Guid id)
        {
            var dto = await _kPI_CauHinhDiemTheoHeSoLanhDaoService.GetDto(id);
            return DataResponse<KPI_CauHinhDiemTheoHeSoLanhDaoDto>.Success(dto);
        }

        [HttpPost("GetData")]
        [ServiceFilter(typeof(LogActionFilter))]
        public async Task<DataResponse<PagedList<KPI_CauHinhDiemTheoHeSoLanhDaoDto>>> GetData([FromBody] KPI_CauHinhDiemTheoHeSoLanhDaoSearch search)
        {
            if (!search.IdBoTieuChi.HasValue)
            {
                var idDonVi = search.IdDonVi ?? DonViId;
                if (idDonVi.HasValue)
                {
                    var queryBoTieuChi = _kPI_BoTieuChiDonViService.GetQueryable().Where(x => x.IdDonVi == idDonVi.Value);
                    if (search.IdDotDanhGia.HasValue)
                    {
                        queryBoTieuChi = queryBoTieuChi.Where(x => x.IdDot == search.IdDotDanhGia.Value);
                    }
                    var boTieuChiDonVi = await queryBoTieuChi.OrderByDescending(x => x.CreatedDate).FirstOrDefaultAsync();
                    if (boTieuChiDonVi != null)
                    {
                        search.IdBoTieuChi = boTieuChiDonVi.Id;
                    }
                }
            }

            var data = await _kPI_CauHinhDiemTheoHeSoLanhDaoService.GetData(search);
            return DataResponse<PagedList<KPI_CauHinhDiemTheoHeSoLanhDaoDto>>.Success(data);
        }

        [HttpGet("GetByDotAndDonVi")]
        public async Task<DataResponse<List<KPI_CauHinhDiemTheoHeSoLanhDaoDto>>> GetByDotAndDonVi([FromQuery] Guid? idDotDanhGia, [FromQuery] Guid? idDonVi)
        {
            try
            {
                var donVi = idDonVi ?? DonViId;
                if (!donVi.HasValue)
                    return DataResponse<List<KPI_CauHinhDiemTheoHeSoLanhDaoDto>>.False("Không tìm thấy thông tin đơn vị");

                var queryBoTieuChi = _kPI_BoTieuChiDonViService.GetQueryable().Where(x => x.IdDonVi == donVi.Value);
                if (idDotDanhGia.HasValue)
                {
                    queryBoTieuChi = queryBoTieuChi.Where(x => x.IdDot == idDotDanhGia.Value);
                }
                
                var boTieuChiDonVi = await queryBoTieuChi.OrderByDescending(x => x.CreatedDate).FirstOrDefaultAsync();
                
                if (boTieuChiDonVi == null)
                    return DataResponse<List<KPI_CauHinhDiemTheoHeSoLanhDaoDto>>.Success(new List<KPI_CauHinhDiemTheoHeSoLanhDaoDto>());

                var data = await _kPI_CauHinhDiemTheoHeSoLanhDaoService.GetQueryable()
                    .Where(x => x.IdBoTieuChi == boTieuChiDonVi.Id && x.IsDeleted == false)
                    .Select(x => new KPI_CauHinhDiemTheoHeSoLanhDaoDto
                    {
                        Id = x.Id,
                        ChucVu = x.ChucVu,
                        HeSo = x.HeSo,
                        IdBoTieuChi = x.IdBoTieuChi
                    })
                    .ToListAsync();

                return DataResponse<List<KPI_CauHinhDiemTheoHeSoLanhDaoDto>>.Success(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy dữ liệu KPI_CauHinhDiemTheoHeSoLanhDao theo đợt và đơn vị");
                return DataResponse<List<KPI_CauHinhDiemTheoHeSoLanhDaoDto>>.False("Đã xảy ra lỗi khi lấy dữ liệu.");
            }
        }

        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id)
        {
            try
            {
                var entity = await _kPI_CauHinhDiemTheoHeSoLanhDaoService.GetByIdAsync(id);
                await _kPI_CauHinhDiemTheoHeSoLanhDaoService.DeleteAsync(entity);
                return DataResponse.Success(null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_CauHinhDiemTheoHeSoLanhDao với Id: {Id}", id);
                return DataResponse.False("Đã xảy ra lỗi khi xóa dữ liệu.");
            }
        }

        [HttpGet("GetDropdowns")]
        public async Task<DataResponse<Dictionary<string, List<DropdownOption>>>> GetDropdowns([FromQuery] string[] types)
        {
            var result = new Dictionary<string, List<DropdownOption>>();
            return DataResponse<Dictionary<string, List<DropdownOption>>>.Success(result);
        }

        [HttpPost("exportExcel")]
        public async Task<DataResponse> ExportExcel([FromBody] KPI_CauHinhDiemTheoHeSoLanhDaoSearch search)
        {
            try
            {
                var data = await _kPI_CauHinhDiemTheoHeSoLanhDaoService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_CauHinhDiemTheoHeSoLanhDaoDto>(data?.Items);
                if (string.IsNullOrEmpty(base64Excel))
                {
                    return DataResponse.False("Kết xuất thất bại hoặc dữ liệu trống");
                }
                return DataResponse.Success(base64Excel);
            }
            catch (Exception)
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_CauHinhDiemTheoHeSoLanhDao");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_CauHinhDiemTheoHeSoLanhDao>(rootPath, "KPI_CauHinhDiemTheoHeSoLanhDao");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_CauHinhDiemTheoHeSoLanhDao>();
                return DataResponse.Success(columns);
            }
            catch (Exception)
            {
                return DataResponse.False("Lấy dữ liệu màn hình import thất bại");
            }
        }
    }
}
