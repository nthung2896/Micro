using CommonHelper.Excel;
using CommonHelper.Extenions;
using CommonHelper.String;
using Elastic.Clients.Elasticsearch;
using Hinet.Api.Dto;
using Hinet.Api.Filter;
using Hinet.Api.Request.Import;
using Hinet.Model.Entities;
using Hinet.Repository.KPI_BoTieuChiDonViRepository;
using Hinet.Service.Common;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.Dto;
using Hinet.Service.KPI_BoTieuChiDonViService;
using Hinet.Service.KPI_BoTieuChiDonViService.ViewModels;
using Hinet.Service.KPI_DotDanhGia_DonViService;
using Hinet.Service.KPI_NhomTieuChiService;
using Hinet.Service.KPI_NhomTieuChiService.Dto;
using Hinet.Service.KPI_NhomTieuChiService.Request;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Web.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Text.RegularExpressions;


using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.KPI_LyLich2CRepository;
using Hinet.Service.KPI_DotTheoDoiDanhGiaService;
using Hinet.Service.KPI_NhiemVuService;
using Hinet.Service.KPI_DauRaNhiemVuService;

namespace Hinet.Controllers
{
    [Route("api/[controller]")]
    public class KPI_NhomTieuChiController : HinetController
    {

        private readonly IMapper _mapper;
        private readonly ILogger<KPI_NhomTieuChiController> _logger;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IKPI_NhomTieuChiService _kPI_NhomTieuChiService;
        private readonly IKPI_BoTieuChiDonViService _kPI_BoTieuChiDonViService;
        private readonly IKPI_DotDanhGia_DonViService _kPI_DotDanhGia_DonViService;
        private readonly IKPI_DotTheoDoiDanhGiaService _kPI_DotTheoDoiDanhGiaService;
        private readonly IKPI_LyLich2CRepository _kPI_LyLich2CRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IKPI_NhiemVuService _kPI_NhiemVuService;
        private readonly IKPI_DauRaNhiemVuService _kPI_DauRaNhiemVuService;
        private readonly IConfiguration _configuration;
        private readonly Hinet.Service.RabbitMQ.IRabbitMQService _rabbitMQService;

        public KPI_NhomTieuChiController(
                IMapper mapper,
                ILogger<KPI_NhomTieuChiController> logger,
                ITaiLieuDinhKemService taiLieuDinhKemService,
                IKPI_NhomTieuChiService kPI_NhomTieuChiService,
                IKPI_BoTieuChiDonViService kPI_BoTieuChiDonViService,
                IKPI_DotDanhGia_DonViService kPI_DotDanhGia_DonViService,
                IKPI_DotTheoDoiDanhGiaService kPI_DotTheoDoiDanhGiaService,
                IKPI_LyLich2CRepository kPI_LyLich2CRepository,
                IDepartmentRepository departmentRepository,
                IKPI_NhiemVuService kPI_NhiemVuService,
                IKPI_DauRaNhiemVuService kPI_DauRaNhiemVuService,
                IConfiguration configuration,
                Hinet.Service.RabbitMQ.IRabbitMQService rabbitMQService
            )
        {
            _logger = logger;
            this._mapper = mapper;
            this._taiLieuDinhKemService = taiLieuDinhKemService;
            this._kPI_NhomTieuChiService = kPI_NhomTieuChiService;
            this._kPI_BoTieuChiDonViService = kPI_BoTieuChiDonViService;
            this._kPI_DotDanhGia_DonViService = kPI_DotDanhGia_DonViService;
            this._kPI_DotTheoDoiDanhGiaService = kPI_DotTheoDoiDanhGiaService;
            this._kPI_LyLich2CRepository = kPI_LyLich2CRepository;
            this._departmentRepository = departmentRepository;
            this._kPI_NhiemVuService = kPI_NhiemVuService;
            this._kPI_DauRaNhiemVuService = kPI_DauRaNhiemVuService;
            this._configuration = configuration;
            this._rabbitMQService = rabbitMQService;
        }

        [HttpPost("Create")]
        public async Task<DataResponse<KPI_NhomTieuChi>> Create(
            [FromBody] KPI_NhomTieuChiRequest model,
            [FromServices] ElasticsearchClient elasticClient)
        {
            try
            {
                var entity = _mapper.Map<KPI_NhomTieuChiRequest, KPI_NhomTieuChi>(model);
                await _kPI_NhomTieuChiService.CreateAsync(entity);

                var syncResult = await SyncToElasticInternal(elasticClient, entity.IdBoTieuChiDonVi);
                var message = syncResult.Success
                    ? "Tạo dữ liệu và đồng bộ Elastic thành công"
                    : $"Đã tạo dữ liệu nhưng chưa đồng bộ được Elastic. {syncResult.Message}";

                return DataResponse<KPI_NhomTieuChi>.Success(entity, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi tạo KPI_NhomTieuChi");
                return DataResponse<KPI_NhomTieuChi>.False("Đã xảy ra lỗi khi tạo dữ liệu.");
            }
        }





        [HttpPut("Update")]
        public async Task<DataResponse<KPI_NhomTieuChi>> Update(
            [FromBody] KPI_NhomTieuChiRequest model,
            [FromServices] ElasticsearchClient elasticClient)
        {
            try
            {
                var entity = await _kPI_NhomTieuChiService.GetByIdAsync(model.Id);
                if (entity == null)
                    return DataResponse<KPI_NhomTieuChi>.False("KPI_NhomTieuChi không tồn tại");

                var previousBoTieuChiDonViId = entity.IdBoTieuChiDonVi;
                entity = _mapper.Map(model, entity);
                await _kPI_NhomTieuChiService.UpdateAsync(entity);

                var syncResult = await SyncChangedBoTieuChiAsync(
                    elasticClient,
                    previousBoTieuChiDonViId,
                    entity.IdBoTieuChiDonVi);
                var message = syncResult.Success
                    ? "Cập nhật dữ liệu và đồng bộ Elastic thành công"
                    : $"Đã cập nhật dữ liệu nhưng chưa đồng bộ được Elastic. {syncResult.Message}";

                return DataResponse<KPI_NhomTieuChi>.Success(entity, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật KPI_NhomTieuChi với Id: {Id}", model.Id);
                return new DataResponse<KPI_NhomTieuChi>()
                {
                    Data = null,
                    Status = false,
                    Message = "Đã xảy ra lỗi khi cập nhật dữ liệu."
                };
            }
        }

        [HttpGet("Get/{id}")]
        public async Task<DataResponse<KPI_NhomTieuChiDto>> Get(Guid id)
        {
            var dto = await _kPI_NhomTieuChiService.GetDto(id);
            return DataResponse<KPI_NhomTieuChiDto>.Success(dto);
        }

        [HttpPost("GetData")]
        public async Task<DataResponse<PagedList<KPI_NhomTieuChiDto>>> GetData([FromBody] KPI_NhomTieuChiSearch search)
        {
            var data = await _kPI_NhomTieuChiService.GetData(search);
            return DataResponse<PagedList<KPI_NhomTieuChiDto>>.Success(data);
        }

        [HttpPost("GetDataElasticExact")]
        public async Task<DataResponse<PagedList<KPI_NhomTieuChiDto>>> GetDataElasticExact([FromBody] KPI_NhomTieuChiSearch search)
        {
            var data = await _kPI_NhomTieuChiService.GetDataElasticExact(search);
            return DataResponse<PagedList<KPI_NhomTieuChiDto>>.Success(data);
        }

        [HttpPost("syncToElasticRabbitMQ")]
        public async Task<DataResponse> SyncToElasticRabbitMQ([FromBody] KPI_NhomTieuChiSearch search)
        {
            try
            {
                var payload = new
                {
                    Action = "SyncElasticAll",
                    Search = search,
                    Timestamp = DateTime.UtcNow
                };

                _rabbitMQService.SendMessage(payload, "sync_elastic_all_queue");
                return DataResponse.Success(null, "Đã gửi yêu cầu đồng bộ ALL lên RabbitMQ (sync_elastic_all_queue) thành công!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi yêu cầu đồng bộ qua RabbitMQ");
                return DataResponse.False("Lỗi khi gửi yêu cầu đồng bộ qua RabbitMQ: " + ex.Message);
            }
        }

        [HttpGet("GetDeXuatTieuChiElastic")]
        public async Task<DataResponse<List<Guid>>> GetDeXuatTieuChiElastic([FromQuery] string? tenNhiemVu, [FromQuery] string? tenSanPham, [FromQuery] Guid? idBoTieuChiDonVi, [FromQuery] List<Guid>? relatedIds)
        {
            var data = await _kPI_NhomTieuChiService.GetDeXuatTieuChiElastic(tenNhiemVu, tenSanPham, idBoTieuChiDonVi, relatedIds);
            return DataResponse<List<Guid>>.Success(data);
        }

        [HttpGet("GetTop3DeXuatTieuChiElastic")]
        public async Task<DataResponse<List<KPI_NhomTieuChiDto>>> GetTop3DeXuatTieuChiElastic([FromQuery] string? tenNhiemVu, [FromQuery] string? tenSanPham, [FromQuery] Guid? idBoTieuChiDonVi, [FromQuery] List<Guid>? relatedIds)
        {
            var data = await _kPI_NhomTieuChiService.GetTop3DeXuatTieuChiElastic(tenNhiemVu, tenSanPham, idBoTieuChiDonVi, relatedIds);
            return DataResponse<List<KPI_NhomTieuChiDto>>.Success(data);
        }


        [HttpGet("GetTreeDataForDot")]
        public async Task<DataResponse<List<KPI_NhomTieuChiDto>>> GetTreeDataForDot([FromQuery] Guid idDot, [FromQuery] Guid? idLyLich, [FromQuery] Guid? idPhieuDanhGia)
        {
            var data = await _kPI_NhomTieuChiService.GetTreeDataForDot(idDot, idLyLich, idPhieuDanhGia);
            return DataResponse<List<KPI_NhomTieuChiDto>>.Success(data);
        }

        [HttpGet("GetTieuChiForCurrentUser")]
        public async Task<DataResponse<List<KPI_NhomTieuChiDto>>> GetTieuChiForCurrentUser([FromQuery] Guid? donViId, [FromQuery] Guid? idDotDanhGia, [FromQuery] Guid? idLyLich)
        {
            try
            {
                Guid? idDonVi = donViId ?? DonViId;
                Guid? idPhongBan = null;

                if (idLyLich.HasValue && idLyLich.Value != Guid.Empty)
                {
                    var lyLich = await _kPI_LyLich2CRepository.GetQueryable()
                        .FirstOrDefaultAsync(x => x.Id == idLyLich.Value || x.UserId == idLyLich.Value);
                    if (lyLich != null)
                    {
                        if (lyLich.PhongBanId != Guid.Empty) idPhongBan = lyLich.PhongBanId;
                        if (idDonVi == null || idDonVi == Guid.Empty) idDonVi = lyLich.DonViSuDungId;
                    }
                }
                else if (UserId.HasValue)
                {
                    var lyLich = await _kPI_LyLich2CRepository.GetQueryable()
                        .FirstOrDefaultAsync(x => x.UserId == UserId.Value);
                    if (lyLich != null)
                    {
                        if (lyLich.PhongBanId != Guid.Empty) idPhongBan = lyLich.PhongBanId;
                        if (idDonVi == null || idDonVi == Guid.Empty) idDonVi = lyLich.DonViSuDungId;
                    }
                }

                if (idDonVi == null && idPhongBan == null)
                    return DataResponse<List<KPI_NhomTieuChiDto>>.False("Không tìm thấy thông tin phòng ban/đơn vị của người dùng");

                // Xây dựng danh sách phòng ban theo thứ tự ưu tiên:
                // [Phòng ban cấp 3 (hiện tại) -> Phòng ban cấp 2 (cha) -> ... -> Đơn vị sử dụng (cấp Cục/Văn phòng)]
                var deptHierarchy = new List<Guid>();
                if (idPhongBan.HasValue && idPhongBan.Value != Guid.Empty)
                {
                    deptHierarchy.Add(idPhongBan.Value);

                    var currId = idPhongBan.Value;
                    var allDepts = await _departmentRepository.GetQueryable().AsNoTracking()
                        .Select(x => new { x.Id, x.ParentId })
                        .ToListAsync();
                    var deptMap = allDepts.ToDictionary(d => d.Id);

                    while (deptMap.TryGetValue(currId, out var dept) && dept.ParentId.HasValue && dept.ParentId.Value != Guid.Empty)
                    {
                        if (deptHierarchy.Contains(dept.ParentId.Value)) break;
                        deptHierarchy.Add(dept.ParentId.Value);
                        currId = dept.ParentId.Value;
                    }
                }

                if (idDonVi.HasValue && idDonVi.Value != Guid.Empty && !deptHierarchy.Contains(idDonVi.Value))
                {
                    deptHierarchy.Add(idDonVi.Value);
                }

                Guid? targetBoTieuChiId = null;

                // 1. Ưu tiên 1: Tìm trong cấu hình đợt (KPI_DotDanhGia_DonVi) theo thứ tự: Cấp 3 -> Cấp 2 (cha) -> Đơn vị sử dụng
                if (idDotDanhGia.HasValue && deptHierarchy.Any())
                {
                    var dotDonVis = await _kPI_DotDanhGia_DonViService.GetQueryable()
                        .Where(x => x.IdDotDanhGia == idDotDanhGia.Value && deptHierarchy.Contains(x.IdDonVi) && x.IdBoChiSoNhiemVu.HasValue)
                        .ToListAsync();

                    foreach (var dId in deptHierarchy)
                    {
                        var match = dotDonVis.FirstOrDefault(x => x.IdDonVi == dId);
                        if (match != null && match.IdBoChiSoNhiemVu.HasValue)
                        {
                            targetBoTieuChiId = match.IdBoChiSoNhiemVu.Value;
                            break;
                        }
                    }
                }

                // 2. Ưu tiên 2: Tìm trong bộ tiêu chí riêng (KPI_BoTieuChiDonVi) theo thứ tự: Cấp 3 -> Cấp 2 (cha) -> Đơn vị sử dụng
                if (!targetBoTieuChiId.HasValue && deptHierarchy.Any())
                {
                    var boTieuChiList = await _kPI_BoTieuChiDonViService.GetQueryable()
                        .Where(x => x.IdDonVi.HasValue && deptHierarchy.Contains(x.IdDonVi.Value) && !x.IsDeleted)
                        .OrderByDescending(x => x.CreatedDate)
                        .ToListAsync();

                    foreach (var dId in deptHierarchy)
                    {
                        var match = boTieuChiList.FirstOrDefault(x => x.IdDonVi == dId);
                        if (match != null)
                        {
                            targetBoTieuChiId = match.Id;
                            break;
                        }
                    }
                }

                // 3. Ưu tiên 3: Bộ tiêu chí mặc định toàn đợt (DefaultTieuChiDonVi của KPI_DotTheoDoiDanhGia)
                if (!targetBoTieuChiId.HasValue && idDotDanhGia.HasValue)
                {
                    var dotTheoDoi = await _kPI_DotTheoDoiDanhGiaService.GetQueryable()
                        .FirstOrDefaultAsync(x => x.Id == idDotDanhGia.Value);

                    if (dotTheoDoi != null && dotTheoDoi.DefaultTieuChiDonVi.HasValue)
                    {
                        targetBoTieuChiId = dotTheoDoi.DefaultTieuChiDonVi.Value;
                    }
                }

                // 4. Ưu tiên 4 (Fallback cuối cùng): Bộ tiêu chí mới nhất bất kỳ trong hệ thống
                if (!targetBoTieuChiId.HasValue)
                {
                    var boTieuChiFallback = await _kPI_BoTieuChiDonViService.GetQueryable()
                        .Where(x => !x.IsDeleted)
                        .OrderByDescending(x => x.CreatedDate)
                        .FirstOrDefaultAsync();

                    if (boTieuChiFallback != null)
                    {
                        targetBoTieuChiId = boTieuChiFallback.Id;
                    }
                }

                if (!targetBoTieuChiId.HasValue)
                    return DataResponse<List<KPI_NhomTieuChiDto>>.False("Đơn vị/phòng ban chưa có bộ tiêu chí nào được cấu hình phù hợp");

                var dataList = await _kPI_NhomTieuChiService.GetQueryable()
                    .Where(x => x.IdBoTieuChiDonVi == targetBoTieuChiId.Value && x.IsDeleted == false)
                    .Select(x => new KPI_NhomTieuChiDto()
                    {
                        Id = x.Id,
                        TenNhomTieuChi = x.TenNhomTieuChi,
                        CongViecChiTiet = x.CongViecChiTiet,
                        SanPhamDauRa = x.SanPhamDauRa,
                        PhanNhom = x.PhanNhom,
                        HeSoQuyDoi = x.HeSoQuyDoi,
                        GhiChu = x.GhiChu,
                        Level = x.Level,
                        ParentID = x.ParentID,
                        Diem = x.Diem,
                        KhungDiemToiDa = x.KhungDiemToiDa,
                        IdBoTieuChiDonVi = x.IdBoTieuChiDonVi,
                        STT = x.STT,
                        CreatedDate = x.CreatedDate
                    })
                    .ToListAsync();

                var sortedData = dataList
                    .OrderBy(x => x.STT ?? int.MaxValue)
                    .ThenBy(x => x.Level)
                    .ThenBy(x => x.TenNhomTieuChi ?? x.CongViecChiTiet ?? x.SanPhamDauRa ?? "", new HierarchicalNumberComparer())
                    .ThenByDescending(x => x.CreatedDate)
                    .ToList();

                return DataResponse<List<KPI_NhomTieuChiDto>>.Success(sortedData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách tiêu chí cho người dùng");
                return DataResponse<List<KPI_NhomTieuChiDto>>.False("Đã xảy ra lỗi khi tải dữ liệu tiêu chí");
            }
        }

        [HttpGet("GetTieuChiForTCCB")]
        public async Task<DataResponse<List<KPI_NhomTieuChiDtoV2>>> GetTieuChiForTCCB(
            [FromQuery] Guid? donViId,
            [FromQuery] Guid? idDotDanhGia,
            [FromQuery] Guid? idLyLich)
        {
            try
            {
                Guid? idDonVi = donViId ?? DonViId;
                Guid? idPhongBan = null;

                if (idLyLich.HasValue && idLyLich.Value != Guid.Empty)
                {
                    var lyLich = await _kPI_LyLich2CRepository.GetQueryable()
                        .FirstOrDefaultAsync(x => x.Id == idLyLich.Value || x.UserId == idLyLich.Value);
                    if (lyLich != null)
                    {
                        if (lyLich.PhongBanId != Guid.Empty) idPhongBan = lyLich.PhongBanId;
                        if (idDonVi == null || idDonVi == Guid.Empty) idDonVi = lyLich.DonViSuDungId;
                    }
                }
                else if (UserId.HasValue)
                {
                    var lyLich = await _kPI_LyLich2CRepository.GetQueryable()
                        .FirstOrDefaultAsync(x => x.UserId == UserId.Value);
                    if (lyLich != null)
                    {
                        if (lyLich.PhongBanId != Guid.Empty) idPhongBan = lyLich.PhongBanId;
                        if (idDonVi == null || idDonVi == Guid.Empty) idDonVi = lyLich.DonViSuDungId;
                    }
                }

                if (idDonVi == null && idPhongBan == null)
                    return DataResponse<List<KPI_NhomTieuChiDtoV2>>.False("Không tìm thấy thông tin phòng ban/đơn vị của người dùng");

                // Xây dựng danh sách phòng ban theo thứ tự ưu tiên:
                // [Phòng ban cấp 3 (hiện tại) -> Phòng ban cấp 2 (cha) -> ... -> Đơn vị sử dụng (cấp Cục/Văn phòng)]
                var deptHierarchy = new List<Guid>();
                if (idPhongBan.HasValue && idPhongBan.Value != Guid.Empty)
                {
                    deptHierarchy.Add(idPhongBan.Value);

                    var currId = idPhongBan.Value;
                    var allDepts = await _departmentRepository.GetQueryable().AsNoTracking()
                        .Select(x => new { x.Id, x.ParentId })
                        .ToListAsync();
                    var deptMap = allDepts.ToDictionary(d => d.Id);

                    while (deptMap.TryGetValue(currId, out var dept) && dept.ParentId.HasValue && dept.ParentId.Value != Guid.Empty)
                    {
                        if (deptHierarchy.Contains(dept.ParentId.Value)) break;
                        deptHierarchy.Add(dept.ParentId.Value);
                        currId = dept.ParentId.Value;
                    }
                }

                if (idDonVi.HasValue && idDonVi.Value != Guid.Empty && !deptHierarchy.Contains(idDonVi.Value))
                {
                    deptHierarchy.Add(idDonVi.Value);
                }

                Guid? targetBoTieuChiId = null;

                // 1. Ưu tiên 1: Tìm trong cấu hình đợt (KPI_DotDanhGia_DonVi) theo thứ tự: Cấp 3 -> Cấp 2 (cha) -> Đơn vị sử dụng
                if (idDotDanhGia.HasValue && deptHierarchy.Any())
                {
                    var dotDonVis = await _kPI_DotDanhGia_DonViService.GetQueryable()
                        .Where(x => x.IdDotDanhGia == idDotDanhGia.Value && deptHierarchy.Contains(x.IdDonVi) && x.IdBoChiSoNhiemVu.HasValue)
                        .ToListAsync();

                    foreach (var dId in deptHierarchy)
                    {
                        var match = dotDonVis.FirstOrDefault(x => x.IdDonVi == dId);
                        if (match != null && match.IdBoChiSoNhiemVu.HasValue)
                        {
                            targetBoTieuChiId = match.IdBoChiSoNhiemVu.Value;
                            break;
                        }
                    }
                }

                // 2. Ưu tiên 2: Tìm trong bộ tiêu chí riêng (KPI_BoTieuChiDonVi) theo thứ tự: Cấp 3 -> Cấp 2 (cha) -> Đơn vị sử dụng
                if (!targetBoTieuChiId.HasValue && deptHierarchy.Any())
                {
                    var boTieuChiList = await _kPI_BoTieuChiDonViService.GetQueryable()
                        .Where(x => x.IdDonVi.HasValue && deptHierarchy.Contains(x.IdDonVi.Value) && !x.IsDeleted)
                        .OrderByDescending(x => x.CreatedDate)
                        .ToListAsync();

                    foreach (var dId in deptHierarchy)
                    {
                        var match = boTieuChiList.FirstOrDefault(x => x.IdDonVi == dId);
                        if (match != null)
                        {
                            targetBoTieuChiId = match.Id;
                            break;
                        }
                    }
                }

                // 3. Ưu tiên 3: Bộ tiêu chí mặc định toàn đợt (DefaultTieuChiDonVi của KPI_DotTheoDoiDanhGia)
                if (!targetBoTieuChiId.HasValue && idDotDanhGia.HasValue)
                {
                    var dotTheoDoi = await _kPI_DotTheoDoiDanhGiaService.GetQueryable()
                        .FirstOrDefaultAsync(x => x.Id == idDotDanhGia.Value);

                    if (dotTheoDoi != null && dotTheoDoi.DefaultTieuChiDonVi.HasValue)
                    {
                        targetBoTieuChiId = dotTheoDoi.DefaultTieuChiDonVi.Value;
                    }
                }

                // 4. Ưu tiên 4 (Fallback cuối cùng): Bộ tiêu chí mới nhất bất kỳ trong hệ thống
                if (!targetBoTieuChiId.HasValue)
                {
                    var boTieuChiFallback = await _kPI_BoTieuChiDonViService.GetQueryable()
                        .Where(x => !x.IsDeleted)
                        .OrderByDescending(x => x.CreatedDate)
                        .FirstOrDefaultAsync();

                    if (boTieuChiFallback != null)
                    {
                        targetBoTieuChiId = boTieuChiFallback.Id;
                    }
                }

                if (!targetBoTieuChiId.HasValue)
                    return DataResponse<List<KPI_NhomTieuChiDtoV2>>.False("Đơn vị/phòng ban chưa có bộ tiêu chí nào được cấu hình phù hợp");

                var dataList = await _kPI_NhomTieuChiService.GetQueryable()
                    .Where(x => x.IdBoTieuChiDonVi == targetBoTieuChiId.Value && x.IsDeleted == false)
                    .Select(x => new KPI_NhomTieuChiDtoV2()
                    {
                        Id = x.Id,
                        TenNhomTieuChi = x.TenNhomTieuChi,
                        CongViecChiTiet = x.CongViecChiTiet,
                        SanPhamDauRa = x.SanPhamDauRa,
                        PhanNhom = x.PhanNhom,
                        HeSoQuyDoi = x.HeSoQuyDoi,
                        GhiChu = x.GhiChu,
                        Level = x.Level,
                        ParentID = x.ParentID,
                        Diem = x.Diem,
                        KhungDiemToiDa = x.KhungDiemToiDa,
                        IdBoTieuChiDonVi = x.IdBoTieuChiDonVi,
                        STT = x.STT,
                        CreatedDate = x.CreatedDate
                    })
                    .ToListAsync();

                var sortedData = dataList
                    .OrderBy(x => x.STT ?? int.MaxValue)
                    .ThenBy(x => x.Level)
                    .ThenBy(x => x.TenNhomTieuChi ?? x.CongViecChiTiet ?? x.SanPhamDauRa ?? "", new HierarchicalNumberComparer())
                    .ThenByDescending(x => x.CreatedDate)
                    .ToList();

                // Fetch KPI_NhiemVu and KPI_DauRaNhiemVu for this LyLich and DotDanhGia
                if (idLyLich.HasValue && idDotDanhGia.HasValue)
                {
                    var allNhiemVu = await _kPI_NhiemVuService.GetQueryable()
                        .Where(x => x.IdLyLich == idLyLich && x.IdDotTheoDoiDanhGia == idDotDanhGia && x.IsDeleted == false)
                        .ToListAsync();

                    var nhiemVuIds = allNhiemVu.Select(x => x.Id).ToList();

                    var allDauRa = await _kPI_DauRaNhiemVuService.GetQueryable()
                        .Where(x => x.IdNhiemVu.HasValue && nhiemVuIds.Contains(x.IdNhiemVu.Value) && x.IsDeleted == false)
                        .ToListAsync();

                    var nhiemVuDtosStr = Newtonsoft.Json.JsonConvert.SerializeObject(allNhiemVu);
                    var nhiemVuDtos = Newtonsoft.Json.JsonConvert.DeserializeObject<List<KPI_NhiemVuDto>>(nhiemVuDtosStr) ?? new List<KPI_NhiemVuDto>();

                    var dauRaDtosStr = Newtonsoft.Json.JsonConvert.SerializeObject(allDauRa);
                    var dauRaDtos = Newtonsoft.Json.JsonConvert.DeserializeObject<List<KPI_DauRaNhiemVuDto>>(dauRaDtosStr) ?? new List<KPI_DauRaNhiemVuDto>();

                    foreach (var nv in nhiemVuDtos)
                    {
                        nv.kPI_DauRaNhiemVuDtos = dauRaDtos.Where(x => x.IdNhiemVu == nv.Id).ToList();
                    }

                    foreach (var tc in sortedData)
                    {
                        tc.kPI_NhiemVuDtos = nhiemVuDtos
                            .Where(nv => nv.kPI_DauRaNhiemVuDtos != null && nv.kPI_DauRaNhiemVuDtos.Any(dr => dr.TieuChiId == tc.Id))
                            .ToList();
                    }
                }

                return DataResponse<List<KPI_NhomTieuChiDtoV2>>.Success(sortedData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi lấy danh sách tiêu chí cho người dùng");
                return DataResponse<List<KPI_NhomTieuChiDtoV2>>.False("Đã xảy ra lỗi khi tải dữ liệu tiêu chí");
            }
        }


        [HttpDelete("Delete/{id}")]
        public async Task<DataResponse> Delete(Guid id, [FromServices] ElasticsearchClient elasticClient)
        {
            try
            {
                var entity = await _kPI_NhomTieuChiService.GetByIdAsync(id);
                if (entity == null)
                {
                    return DataResponse.False("KPI_NhomTieuChi không tồn tại");
                }

                var boTieuChiDonViId = entity.IdBoTieuChiDonVi;
                await _kPI_NhomTieuChiService.DeleteAsync(entity);

                var syncResult = await SyncToElasticInternal(elasticClient, boTieuChiDonViId);
                var message = syncResult.Success
                    ? "Xóa dữ liệu và đồng bộ Elastic thành công"
                    : $"Đã xóa dữ liệu nhưng chưa đồng bộ được Elastic. {syncResult.Message}";

                return DataResponse.Success(null, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi xóa KPI_NhomTieuChi với Id: {Id}", id);
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


        [HttpGet("ExportExcel")]
        public async Task<DataResponse> ExportExcel([FromBody] KPI_NhomTieuChiSearch search)
        {
            try
            {
                var data = await _kPI_NhomTieuChiService.GetData(search);
                var base64Excel = await ExportExcelHelperNetCore.Export<KPI_NhomTieuChiDto>(data?.Items);
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
                var base64 = ExcelImportExtention.ConvertToBase64(rootPath, "KPI_NhomTieuChi");
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
                ExcelImportExtention.CreateExcelWithDisplayNames<KPI_NhomTieuChi>(rootPath, "KPI_NhomTieuChi");
                var columns = ExcelImportExtention.GetColumnNamesWithOrder<KPI_NhomTieuChi>();
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

                var importHelper = new ImportExcelHelperNetCore<KPI_NhomTieuChi>();
                importHelper.PathTemplate = filePath;
                importHelper.StartCol = 1;
                importHelper.StartRow = 2;
                importHelper.ConfigColumn = new List<ConfigModule>();
                importHelper.ConfigColumn = ExcelImportExtention.GetConfigCol<KPI_NhomTieuChi>(data.Collection);
                #endregion
                var rsl = importHelper.Import();

                var listImportReponse = new List<KPI_NhomTieuChi>();
                if (rsl.ListTrue != null && rsl.ListTrue.Count > 0)
                {
                    listImportReponse.AddRange(rsl.ListTrue);
                    await _kPI_NhomTieuChiService.CreateAsync(rsl.ListTrue);
                }

                var response = new ResponseImport<KPI_NhomTieuChi>();

                response.ListTrue = listImportReponse;
                response.lstFalse = rsl.lstFalse;

                return DataResponse.Success(response);
            }
            catch (Exception)
            {
                return DataResponse.False("Import thất bại");
            }
        }



        [HttpPost("CheckFileWorksheet")]
        public async Task<DataResponse> CheckFileWorksheet(IFormFile file)
        {
            try
            {
                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    stream.Position = 0;
                    OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                    using (var package = new OfficeOpenXml.ExcelPackage(stream))
                    {
                        var worksheet = package.Workbook.Worksheets
                            .Where(ws => ws.Hidden == OfficeOpenXml.eWorkSheetHidden.Visible);

                        if (worksheet != null || worksheet.Count() > 0)
                        {
                            var listSheets = worksheet.Select(x => x.Name).ToList();
                            return DataResponse.Success(listSheets);
                        }

                        return DataResponse.Success(null);
                    }
                }
            }
            catch (Exception ex)
            {
                return DataResponse.False("Lỗi khi kiểm tra file Excel: " + ex.Message);
            }
        }

        [HttpPost("GetHeaderWorksheet")]
        public async Task<DataResponse> GetHeaderWorksheet(IFormFile file, [FromForm] string WorkSheetName)
        {
            try
            {
                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    stream.Position = 0;
                    OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                    using (var package = new OfficeOpenXml.ExcelPackage(stream))
                    {
                        OfficeOpenXml.ExcelWorksheet worksheet = null;

                        if (!string.IsNullOrEmpty(WorkSheetName))
                        {
                            worksheet = package.Workbook.Worksheets[WorkSheetName];
                        }

                        if (worksheet == null)
                        {
                            worksheet = package.Workbook.Worksheets.FirstOrDefault(ws => ws.Hidden == OfficeOpenXml.eWorkSheetHidden.Visible);
                        }

                        if (worksheet == null)
                        {
                            return DataResponse.False("Không tìm thấy worksheet trong file.");
                        }

                        var dimension = worksheet.Dimension;
                        if (dimension == null)
                        {
                            return DataResponse.False("Worksheet không có dữ liệu.");
                        }

                        int startRow = -1;
                        int startCol = -1;

                        // 1. Quét tìm dòng tiêu đề Header của bảng (yêu cầu khớp ít nhất 2 cột chuẩn của bảng)
                        for (int row = 1; row <= Math.Min(dimension.End.Row, 30); row++)
                        {
                            int matchCount = 0;
                            int firstMatchedCol = -1;

                            for (int col = 1; col <= dimension.End.Column; col++)
                            {
                                var cellText = worksheet.Cells[row, col].Text?.Trim().ToUpper() ?? "";
                                if (string.IsNullOrEmpty(cellText)) continue;

                                bool isHeaderCell = false;
                                if (cellText == "STT" || cellText == "TT" || cellText == "SỐ TT") isHeaderCell = true;
                                else if (cellText == "NHIỆM VỤ" || cellText == "TÊN NHIỆM VỤ" || cellText.StartsWith("NHIỆM VỤ (") || cellText == "CÔNG VIỆC/NHIỆM VỤ") isHeaderCell = true;
                                else if (cellText.Contains("CÔNG VIỆC CHI TIẾT") || cellText == "CVCT") isHeaderCell = true;
                                else if (cellText.Contains("SẢN PHẨM") || cellText.Contains("KẾT QUẢ ĐẦU RA")) isHeaderCell = true;
                                else if (cellText.Contains("ĐIỂM CHẤM") || cellText == "ĐIỂM" || cellText == "KHUNG ĐIỂM") isHeaderCell = true;
                                else if (cellText.Contains("HỆ SỐ")) isHeaderCell = true;

                                if (isHeaderCell)
                                {
                                    matchCount++;
                                    if (firstMatchedCol == -1) firstMatchedCol = col;
                                }
                            }

                            if (matchCount >= 2)
                            {
                                startRow = row;
                                startCol = firstMatchedCol;
                                break;
                            }
                        }

                        if (startRow == -1)
                        {
                            return DataResponse.False("Không tìm thấy dòng tiêu đề bảng (header) chứa các cột 'STT', 'NHIỆM VỤ', 'CÔNG VIỆC CHI TIẾT'...");
                        }

                        var headers = new List<object>();
                        for (int col = startCol; col <= dimension.End.Column; col++)
                        {
                            var headerText = worksheet.Cells[startRow, col].Text?.Trim();
                            if (col == startCol && (string.IsNullOrEmpty(headerText) || headerText == "1"))
                            {
                                headerText = "STT";
                            }

                            if (string.IsNullOrEmpty(headerText))
                            {
                                break;
                            }
                            headers.Add(new
                            {
                                Name = headerText,
                                Row = startRow,
                                Col = col
                            });
                        }

                        int dataStartRow = startRow + 1;
                        // Nếu dòng ngay sau header chỉ là dòng số thứ tự cột "(1)", "(2)", "(3)"... thì bỏ qua
                        var nextRowCell = worksheet.Cells[startRow + 1, startCol].Text?.Trim();
                        if (!string.IsNullOrEmpty(nextRowCell) && System.Text.RegularExpressions.Regex.IsMatch(nextRowCell, @"^\(?\d+\)?$") &&
                            worksheet.Cells[startRow + 1, startCol + 1].Text?.Trim() is string c2 && System.Text.RegularExpressions.Regex.IsMatch(c2, @"^\(?\d+\)?$"))
                        {
                            dataStartRow = startRow + 2;
                        }

                        var result = new
                        {
                            Headers = headers,
                            StartRow = startRow,
                            StartCol = startCol,
                            TotalColumns = headers.Count,
                            DataStartRow = dataStartRow
                        };

                        return DataResponse.Success(result);
                    }
                }
            }
            catch (Exception ex)
            {
                return DataResponse.False("Lỗi khi đọc file Excel: " + ex.Message);
            }
        }

        [HttpPost("ImportExcelDirect")]
        public async Task<DataResponse> ImportExcelDirect(IFormFile file, [FromForm] KPI_BoTieuChiDonViImportVM data, [FromServices] ElasticsearchClient elasticClient)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return DataResponse.False("Vui lòng chọn file Excel để import");
                }

                if (data == null) data = new KPI_BoTieuChiDonViImportVM();
                // Check if WorkSheetName is sent in the Request.Form directly since it might not be in KPI_BoTieuChiDonViImportVM
                string workSheetName = Request.Form["WorkSheetName"].FirstOrDefault();

                var listTrue = new List<KPI_NhomTieuChi>();
                var lstFalse = new List<object>();
                Guid? importedBoTieuChiDonViId = null;

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);
                    stream.Position = 0;
                    OfficeOpenXml.ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.NonCommercial;

                    using (var package = new OfficeOpenXml.ExcelPackage(stream))
                    {
                        OfficeOpenXml.ExcelWorksheet worksheet = null;

                        if (!string.IsNullOrEmpty(workSheetName))
                        {
                            worksheet = package.Workbook.Worksheets[workSheetName];
                        }

                        if (worksheet == null)
                        {
                            worksheet = package.Workbook.Worksheets.FirstOrDefault(ws => ws.Hidden == OfficeOpenXml.eWorkSheetHidden.Visible);
                        }

                        if (worksheet == null) return DataResponse.False("File Excel không có dữ liệu");

                        int rowCount = worksheet.Dimension.Rows;

                        Guid? masterHeaderId = null; // Cấp 0: Số La Mã (I., II.) - Cha cao nhất
                        Guid? subHeaderId = null;    // Cấp 1: Dấu * hoặc Mảng công việc (Con của La Mã, Cha của số thường)
                        Guid? level2Id = null;       // Cấp 2: Số thường (1., 2., 3.) / Tên nhiệm vụ cụ thể
                        Guid? level3Id = null;       // Cấp 3: Công việc chi tiết

                        var tenTieuChi = "";

                        if (!string.IsNullOrEmpty(data.TenBoTieuChiDonVi))
                        {
                            tenTieuChi = data.TenBoTieuChiDonVi;
                        }
                        else
                        {
                            var headerRow = worksheet.Cells[data.RowName ?? 1, 1].Text.Trim();
                            if (string.IsNullOrWhiteSpace(headerRow))
                            {
                                headerRow = worksheet.Cells[data.RowName ?? 1, 2].Text.Trim();
                            }
                            if (string.IsNullOrWhiteSpace(headerRow) && worksheet.Cells[3, 2].Text.Trim() is string t2 && !string.IsNullOrWhiteSpace(t2))
                            {
                                headerRow = t2;
                            }
                            tenTieuChi = headerRow;
                        }

                        var thongTinNgaySoQuyetDinh = worksheet.Cells[data.RowInfo ?? 2, 2].Text.Trim();
                        if (string.IsNullOrWhiteSpace(thongTinNgaySoQuyetDinh) && worksheet.Cells[4, 2].Text.Trim() is string qd2 && !string.IsNullOrWhiteSpace(qd2))
                        {
                            thongTinNgaySoQuyetDinh = qd2;
                        }
                        var soQuyetDinh = data.SoQuyetDinh ?? "";
                        DateTime? ngayQuyetDinh = data.NgayQuyetDinh;

                        if (string.IsNullOrWhiteSpace(soQuyetDinh) || !ngayQuyetDinh.HasValue)
                        {
                            if (!string.IsNullOrWhiteSpace(thongTinNgaySoQuyetDinh))
                            {
                                if (string.IsNullOrWhiteSpace(soQuyetDinh))
                                {
                                    var matchSo = Regex.Match(thongTinNgaySoQuyetDinh, @"(?:Quyết định số|số)\s+([^\s,]+(?:/\S+)?)", RegexOptions.IgnoreCase);
                                    if (matchSo.Success)
                                    {
                                        soQuyetDinh = matchSo.Groups[1].Value.Trim();
                                    }
                                    else
                                    {
                                        soQuyetDinh = thongTinNgaySoQuyetDinh;
                                    }
                                }

                                if (!ngayQuyetDinh.HasValue)
                                {
                                    var matchNgay = Regex.Match(thongTinNgaySoQuyetDinh, @"ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})", RegexOptions.IgnoreCase);
                                    if (matchNgay.Success &&
                                        int.TryParse(matchNgay.Groups[1].Value, out int day) &&
                                        int.TryParse(matchNgay.Groups[2].Value, out int month) &&
                                        int.TryParse(matchNgay.Groups[3].Value, out int year))
                                    {
                                        try
                                        {
                                            ngayQuyetDinh = new DateTime(year, month, day);
                                        }
                                        catch { }
                                    }
                                    else
                                    {
                                        var matchDateStd = Regex.Match(thongTinNgaySoQuyetDinh, @"(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})");
                                        if (matchDateStd.Success &&
                                            int.TryParse(matchDateStd.Groups[1].Value, out int d) &&
                                            int.TryParse(matchDateStd.Groups[2].Value, out int m) &&
                                            int.TryParse(matchDateStd.Groups[3].Value, out int y))
                                        {
                                            try
                                            {
                                                ngayQuyetDinh = new DateTime(y, m, d);
                                            }
                                            catch { }
                                        }
                                    }
                                }
                            }
                        }

                        var boTieuChiDonVi = new KPI_BoTieuChiDonVi
                        {
                            TenBoTieuChiDonVi = !string.IsNullOrEmpty(tenTieuChi) ? tenTieuChi : "Bộ tiêu chí đơn vị",
                            IdDonVi = data.IdDonVi,
                            IdDot = data.IdDot,
                            ApDungTuNgay = data.ApDungTuNgay ?? DateTime.Now,
                            ApDungToiNgay = data.ApDungToiNgay ?? DateTime.Now.AddYears(1),
                            SoQuyetDinh = soQuyetDinh,
                            NgayQuyetDinh = ngayQuyetDinh,
                            Is_locked = false
                        };

                        // Lưu thông tin bộ tiêu chí đơn vị trước khi import các nhóm tiêu chí
                        await _kPI_BoTieuChiDonViService.CreateAsync(boTieuChiDonVi);
                        importedBoTieuChiDonViId = boTieuChiDonVi.Id;

                        if (boTieuChiDonVi.IdDonVi.HasValue)
                        {
                            await _kPI_BoTieuChiDonViService.SetActiveBoTieuChiDonViAsync(boTieuChiDonVi.Id, boTieuChiDonVi.IdDonVi.Value);
                        }

                        int startRow = data != null && data.RowStart > 0 ? data.RowStart : 3;
                        if (int.TryParse(Request.Form["RowStart"], out int rsForm) && rsForm > 0 && (data == null || data.RowStart == 3 || rsForm != startRow))
                        {
                            startRow = rsForm; // Fallback lấy từ Form nếu ASP.NET Core model binding trượt hoặc nhận mặc định
                        }

                        int startCol = data != null && data.StartCol > 0 ? data.StartCol : 1;
                        if (int.TryParse(Request.Form["StartCol"], out int scForm) && scForm > 0 && (data == null || data.StartCol == 1 || scForm != startCol))
                        {
                            startCol = scForm;
                        }

                        int offset = startCol - 1;

                        int totalCols = data != null && data.TotalColumns > 0 ? data.TotalColumns : 7;
                        if (int.TryParse(Request.Form["TotalColumns"], out int tcForm) && tcForm > 0 && (data == null || data.TotalColumns == 7 || tcForm != totalCols))
                        {
                            totalCols = tcForm;
                        }

                        // Local helper to read merged cells (Fix EPPlus handling where non-start cells in a merge range have cell.Value == null)
                        string GetCellValue(int r, int c, bool emptyForMergedSubsequent = true)
                        {
                            if (c <= 0 || r <= 0) return "";
                            try
                            {
                                var cell = worksheet.Cells[r, c];
                                if (cell == null) return "";

                                if (cell.Merge)
                                {
                                    var mergeAddress = worksheet.MergedCells[r, c];
                                    if (!string.IsNullOrEmpty(mergeAddress))
                                    {
                                        var range = worksheet.Cells[mergeAddress];
                                        if (emptyForMergedSubsequent && (r != range.Start.Row || c != range.Start.Column))
                                        {
                                            return "";
                                        }
                                        var startCell = worksheet.Cells[range.Start.Row, range.Start.Column];
                                        string mergedText = startCell?.Text?.Trim() ?? "";
                                        if (mergedText.StartsWith("#") && (mergedText.Contains("NAME?") || mergedText.Contains("REF!") || mergedText.Contains("VALUE!") || mergedText.Contains("N/A")))
                                        {
                                            return "";
                                        }
                                        return mergedText;
                                    }
                                }

                                if (cell.Value == null) return "";
                                string rawText = cell.Text?.Trim() ?? "";
                                if (rawText.StartsWith("#") && (rawText.Contains("NAME?") || rawText.Contains("REF!") || rawText.Contains("VALUE!") || rawText.Contains("N/A")))
                                {
                                    return "";
                                }
                                return rawText;
                            }
                            catch
                            {
                                return "";
                            }
                        }

                        // Default offsets
                        int colSTTIndex = 1 + offset;
                        int colNhiemVuIndex = 2 + offset;
                        int colCongViecIndex = 3 + offset;
                        int colSanPhamIndex = 4 + offset;

                        int colDiemIndex = 6 + offset;
                        int colHeSoIndex = 7 + offset;
                        int colGhiChuIndex = 8 + offset;
                        int colPhanNhomIndex = -1;
                        int colKhungDiemIndex = -1;

                        if (totalCols == 7)
                        {
                            colDiemIndex = 5 + offset;
                            colHeSoIndex = 6 + offset;
                            colGhiChuIndex = 7 + offset;
                        }
                        else if (totalCols == 9)
                        {
                            colPhanNhomIndex = 5 + offset;
                            colKhungDiemIndex = 6 + offset;
                            colDiemIndex = 7 + offset;
                            colHeSoIndex = 8 + offset;
                            colGhiChuIndex = 9 + offset;
                        }

                        // Tự động quét Header trực tiếp từ file Excel để định vị chính xác 100% các cột
                        int detectedHeaderRow = -1;
                        for (int r = 1; r <= Math.Min(30, rowCount); r++)
                        {
                            int matchCount = 0;
                            for (int c = 1; c <= Math.Min(20, worksheet.Dimension.End.Column); c++)
                            {
                                string txt = GetCellValue(r, c, false).Trim().ToUpper();
                                if (string.IsNullOrEmpty(txt)) continue;

                                if (txt == "STT" || txt == "TT" || txt == "SỐ TT") matchCount++;
                                else if (txt == "NHIỆM VỤ" || txt == "TÊN NHIỆM VỤ" || txt.StartsWith("NHIỆM VỤ (") || txt == "CÔNG VIỆC/NHIỆM VỤ") matchCount++;
                                else if (txt.Contains("CÔNG VIỆC CHI TIẾT") || txt == "CVCT") matchCount++;
                                else if (txt.Contains("SẢN PHẨM") || txt.Contains("KẾT QUẢ ĐẦU RA")) matchCount++;
                                else if (txt.Contains("ĐIỂM CHẤM") || txt == "ĐIỂM" || txt == "KHUNG ĐIỂM") matchCount++;
                                else if (txt.Contains("HỆ SỐ")) matchCount++;
                            }
                            if (matchCount >= 2)
                            {
                                detectedHeaderRow = r;
                                break;
                            }
                        }

                        if (detectedHeaderRow > 0)
                        {
                            for (int c = 1; c <= worksheet.Dimension.End.Column; c++)
                            {
                                string hName = GetCellValue(detectedHeaderRow, c, false).Trim().ToUpper();
                                if (string.IsNullOrEmpty(hName)) continue;

                                if (hName == "STT" || hName == "TT" || hName == "SỐ TT") colSTTIndex = c;
                                else if (hName == "NHIỆM VỤ" || hName == "TÊN NHIỆM VỤ" || hName.StartsWith("NHIỆM VỤ")) colNhiemVuIndex = c;
                                else if (hName.Contains("CÔNG VIỆC CHI TIẾT") || hName == "CVCT") colCongViecIndex = c;
                                else if (hName.Contains("SẢN PHẨM") || hName.Contains("KẾT QUẢ")) colSanPhamIndex = c;
                                else if (hName.Contains("PHÂN NHÓM")) colPhanNhomIndex = c;
                                else if (hName.Contains("KHUNG ĐIỂM")) colKhungDiemIndex = c;
                                else if (hName.Contains("ĐIỂM CHẤM") || hName == "ĐIỂM") colDiemIndex = c;
                                else if (hName.Contains("HỆ SỐ")) colHeSoIndex = c;
                                else if (hName.Contains("GHI CHÚ")) colGhiChuIndex = c;
                            }

                            if (startRow <= detectedHeaderRow)
                            {
                                startRow = detectedHeaderRow + 1;
                            }
                        }

                        // Dynamic mapping based on ColumnHeaderList (nếu client gửi thêm)
                        if (data != null && data.ColumnHeaderList != null && data.ColumnHeaderList.Any())
                        {
                            foreach (var h in data.ColumnHeaderList)
                            {
                                if (string.IsNullOrEmpty(h.Name)) continue;
                                string name = h.Name.Trim().ToLower();

                                if (name == "stt" || name == "tt") colSTTIndex = h.Col;
                                else if (name.Contains("nhiệm vụ")) colNhiemVuIndex = h.Col;
                                else if (name.Contains("công việc chi tiết") || name.Contains("cvct")) colCongViecIndex = h.Col;
                                else if (name.Contains("sản phẩm")) colSanPhamIndex = h.Col;
                                else if (name.Contains("phân nhóm")) colPhanNhomIndex = h.Col;
                                else if (name.Contains("khung điểm")) colKhungDiemIndex = h.Col;
                                else if (name.Contains("điểm chấm") || name == "điểm") colDiemIndex = h.Col;
                                else if (name.Contains("hệ số")) colHeSoIndex = h.Col;
                                else if (name.Contains("ghi chú")) colGhiChuIndex = h.Col;
                            }
                        }

                        // Local helper to validate STT
                        bool IsValidSTT(string stt)
                        {
                            if (string.IsNullOrWhiteSpace(stt)) return true; // Empty STT is valid (child items)
                            stt = stt.Trim();
                            if (stt.StartsWith("*") || stt.StartsWith("-") || stt.StartsWith("•")) return true;

                            // Lấy từ đầu tiên (ví dụ "I. CÔNG TÁC..." -> lấy "I.")
                            string firstWord = stt.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "";
                            string upperFirst = firstWord.ToUpper();

                            // 1. Check if the first word is a number/decimal (e.g. 1, 1.1, 2.)
                            if (System.Text.RegularExpressions.Regex.IsMatch(upperFirst, @"^[\d\.]+$")) return true;

                            // 2. Check if the first word is a roman numeral (I, II, IV, I. etc.)
                            string withoutDot = upperFirst.Replace(".", "");
                            if (!string.IsNullOrEmpty(withoutDot) && withoutDot.All(ch => "IVXLCDM".Contains(ch)))
                                return true;

                            // 3. Cho phép các tiền tố chữ cái (A., B., A, B...)
                            if (withoutDot.Length == 1 && char.IsLetter(withoutDot[0]))
                                return true;

                            return true;
                        }

                        // Bắt đầu đọc từ dòng được nhập vào (bỏ qua header)
                        for (int row = startRow; row <= rowCount; row++)
                        {
                            string sttValue = GetCellValue(row, colSTTIndex, true);
                            string nhiemVuValue = GetCellValue(row, colNhiemVuIndex, true);
                            string congViecValue = GetCellValue(row, colCongViecIndex, true);
                            string sanPham = GetCellValue(row, colSanPhamIndex, true);

                            // Dừng đọc toàn bộ nếu gặp dòng "Lưu ý:" hoặc "Ghi chú:" ở cuối file
                            string sttLower = sttValue.Trim().ToLower();
                            string nhiemVuLower = nhiemVuValue.Trim().ToLower();
                            if (sttLower.StartsWith("lưu ý") || sttLower.StartsWith("ghi chú") ||
                                nhiemVuLower.StartsWith("lưu ý") || nhiemVuLower.StartsWith("ghi chú"))
                            {
                                break;
                            }

                            // Nếu STT có giá trị nhưng không hợp lệ thì skip dòng này
                            if (!IsValidSTT(sttValue))
                            {
                                continue;
                            }

                            string phanNhom = GetCellValue(row, colPhanNhomIndex, false);
                            int? khungDiemToiDa = null;
                            if (colKhungDiemIndex > 0)
                            {
                                string rawKd = GetCellValue(row, colKhungDiemIndex, true).Replace(",", ".");
                                if (double.TryParse(rawKd, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double kd))
                                    khungDiemToiDa = (int)Math.Round(kd);
                            }

                            int? diemVal = null;
                            if (colDiemIndex > 0)
                            {
                                string rawDiem = GetCellValue(row, colDiemIndex, true).Replace(",", ".");
                                if (double.TryParse(rawDiem, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double d))
                                    diemVal = (int)Math.Round(d);
                            }

                            int? heSoVal = null;
                            if (colHeSoIndex > 0)
                            {
                                string rawHeSo = GetCellValue(row, colHeSoIndex, true).Replace(",", ".");
                                if (double.TryParse(rawHeSo, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double h))
                                    heSoVal = (int)Math.Round(h);
                            }

                            int? ghiChuVal = null;
                            if (colGhiChuIndex > 0 && int.TryParse(GetCellValue(row, colGhiChuIndex, false), out int g)) ghiChuVal = g;

                            if (string.IsNullOrWhiteSpace(sttValue) && string.IsNullOrWhiteSpace(nhiemVuValue) && string.IsNullOrWhiteSpace(congViecValue) &&
                                string.IsNullOrWhiteSpace(sanPham) && !diemVal.HasValue && !heSoVal.HasValue && !ghiChuVal.HasValue)
                            {
                                continue;
                            }

                            bool IsRomanNumeral(string text)
                            {
                                if (string.IsNullOrEmpty(text)) return false;
                                return System.Text.RegularExpressions.Regex.IsMatch(text, @"^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$");
                            }

                            bool IsRomanNumeralHeader(string text)
                            {
                                if (string.IsNullOrWhiteSpace(text)) return false;
                                string firstWord = text.Trim().Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "";
                                if (string.IsNullOrEmpty(firstWord)) return false;

                                string cleanFirst = firstWord.TrimEnd('.');
                                if (cleanFirst.Contains(".")) return false; // Tránh nhầm với I.1, I.2

                                return IsRomanNumeral(cleanFirst);
                            }

                            // Kiểm tra dạng I.1, I.2, II.1, II.2... (đồng cấp với dấu *)
                            bool IsRomanSubHeader(string text)
                            {
                                if (string.IsNullOrWhiteSpace(text)) return false;
                                string firstWord = text.Trim().Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "";
                                return System.Text.RegularExpressions.Regex.IsMatch(firstWord, @"^[IVXLCDM]+\.\d+", RegexOptions.IgnoreCase);
                            }

                            bool isRomanHeader = IsRomanNumeralHeader(sttValue) || IsRomanNumeralHeader(nhiemVuValue);

                            // 1. DÒNG SỐ LA MÃ (I., II.) -> MASTER HEADER (Cấp 0 - Cha cao nhất)
                            if (isRomanHeader)
                            {
                                // Nếu cột nhiệm vụ bị rỗng (do ô merge hoặc lệch cột), quét tìm nội dung text trong toàn bộ dòng
                                if (string.IsNullOrWhiteSpace(nhiemVuValue))
                                {
                                    for (int c = 1; c <= worksheet.Dimension.End.Column; c++)
                                    {
                                        if (c == colSTTIndex) continue;
                                        string cellVal = GetCellValue(row, c, false);
                                        if (!string.IsNullOrWhiteSpace(cellVal) && cellVal != sttValue)
                                        {
                                            nhiemVuValue = cellVal;
                                            break;
                                        }
                                    }
                                }

                                string tenMaster = "";
                                if (IsRomanNumeralHeader(sttValue))
                                {
                                    string sttClean = sttValue.Trim().TrimEnd('.');
                                    if (!string.IsNullOrWhiteSpace(nhiemVuValue))
                                    {
                                        if (nhiemVuValue.Trim().StartsWith(sttClean, StringComparison.OrdinalIgnoreCase))
                                        {
                                            tenMaster = nhiemVuValue.Trim();
                                        }
                                        else
                                        {
                                            string separator = sttValue.Trim().EndsWith(".") ? " " : ". ";
                                            tenMaster = sttValue.Trim() + separator + nhiemVuValue.Trim();
                                        }
                                    }
                                    else
                                    {
                                        tenMaster = sttValue.Trim();
                                    }
                                }
                                else if (!string.IsNullOrWhiteSpace(nhiemVuValue))
                                {
                                    tenMaster = nhiemVuValue.Trim();
                                }
                                else
                                {
                                    tenMaster = sttValue.Trim();
                                }

                                var entityMaster = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = tenMaster,
                                    ParentID = null,
                                    Level = 0,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    STT = listTrue.Count + 1
                                };
                                masterHeaderId = entityMaster.Id;
                                subHeaderId = null; // Reset sub-header
                                level2Id = null;
                                level3Id = null;
                                listTrue.Add(entityMaster);
                                continue;
                            }

                            // 2. DÒNG DẤU * HOẶC I.1, I.2 HOẶC TIÊU ĐỀ MẢNG CÔNG VIỆC -> SUB-HEADER (Cấp 1 - Con của La Mã, Cha của số thường)
                            bool isSubHeader = IsRomanSubHeader(sttValue) || IsRomanSubHeader(nhiemVuValue);
                            if (!isSubHeader && !diemVal.HasValue && !heSoVal.HasValue && string.IsNullOrWhiteSpace(sanPham) && string.IsNullOrWhiteSpace(congViecValue))
                            {
                                string headerCand = !string.IsNullOrWhiteSpace(sttValue) ? sttValue.Trim() : (nhiemVuValue ?? "").Trim();
                                if (!string.IsNullOrWhiteSpace(headerCand))
                                {
                                    if (headerCand.StartsWith("*") ||
                                        System.Text.RegularExpressions.Regex.IsMatch(headerCand, @"^[A-Z]\.\s+") ||
                                        System.Text.RegularExpressions.Regex.IsMatch(headerCand, @"^(PHẦN|MỤC|CHƯƠNG)\s+", RegexOptions.IgnoreCase) ||
                                        headerCand.StartsWith("THỰC HIỆN CÁC NHIỆM VỤ", StringComparison.OrdinalIgnoreCase) ||
                                        headerCand.StartsWith("Nhiệm vụ Ban", StringComparison.OrdinalIgnoreCase) ||
                                        headerCand.StartsWith("Nhiệm vụ nghiên cứu", StringComparison.OrdinalIgnoreCase))
                                    {
                                        isSubHeader = true;
                                    }
                                }
                            }

                            if (isSubHeader)
                            {
                                // Nếu cột nhiệm vụ bị rỗng, quét tìm nội dung text trong toàn bộ dòng
                                if (string.IsNullOrWhiteSpace(nhiemVuValue))
                                {
                                    for (int c = 1; c <= worksheet.Dimension.End.Column; c++)
                                    {
                                        if (c == colSTTIndex) continue;
                                        string cellVal = GetCellValue(row, c, false);
                                        if (!string.IsNullOrWhiteSpace(cellVal) && cellVal != sttValue)
                                        {
                                            nhiemVuValue = cellVal;
                                            break;
                                        }
                                    }
                                }

                                // Tự động khởi tạo Master Header (Level 0) nếu chưa có
                                if (masterHeaderId == null)
                                {
                                    var defaultMaster = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = "I. CÔNG TÁC CHUYÊN MÔN / NHIỆM VỤ CỦA ĐƠN VỊ",
                                        ParentID = null,
                                        Level = 0,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        STT = listTrue.Count + 1
                                    };
                                    masterHeaderId = defaultMaster.Id;
                                    listTrue.Add(defaultMaster);
                                }

                                string tenSub = "";
                                if (IsRomanSubHeader(sttValue))
                                {
                                    string sttClean = sttValue.Trim().TrimEnd('.');
                                    if (!string.IsNullOrWhiteSpace(nhiemVuValue))
                                    {
                                        if (nhiemVuValue.Trim().StartsWith(sttClean, StringComparison.OrdinalIgnoreCase))
                                        {
                                            tenSub = nhiemVuValue.Trim();
                                        }
                                        else
                                        {
                                            string sep = sttValue.Trim().EndsWith(".") ? " " : ". ";
                                            tenSub = sttValue.Trim() + sep + nhiemVuValue.Trim();
                                        }
                                    }
                                    else
                                    {
                                        tenSub = sttValue.Trim();
                                    }
                                }
                                else
                                {
                                    tenSub = !string.IsNullOrWhiteSpace(nhiemVuValue) ? nhiemVuValue.Trim() : sttValue.Trim();
                                    if (!string.IsNullOrWhiteSpace(sttValue) && !string.IsNullOrWhiteSpace(nhiemVuValue) && !nhiemVuValue.StartsWith(sttValue))
                                    {
                                        tenSub = sttValue.Trim() + " " + tenSub;
                                    }
                                }

                                var entitySub = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = tenSub,
                                    ParentID = masterHeaderId, // Con của Số La Mã!
                                    Level = 1,                 // Cấp 1 (Sub-header)
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    STT = listTrue.Count + 1
                                };
                                subHeaderId = entitySub.Id;
                                level2Id = null;
                                level3Id = null;
                                listTrue.Add(entitySub);
                                continue;
                            }

                            // Tự động khởi tạo Master Header nếu file vào thẳng các nhiệm vụ con
                            if (masterHeaderId == null)
                            {
                                var defaultMaster = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = "I. CÔNG TÁC CHUYÊN MÔN / NHIỆM VỤ CỦA ĐƠN VỊ",
                                    ParentID = null,
                                    Level = 0,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    STT = listTrue.Count + 1
                                };
                                masterHeaderId = defaultMaster.Id;
                                listTrue.Add(defaultMaster);
                            }

                            // 3. DÒNG NHIỆM VỤ (Số thường 1., 2., 3...) -> Cấp 2 (Con của dấu * hoặc con của La Mã)
                            if (!string.IsNullOrWhiteSpace(nhiemVuValue))
                            {
                                var level2Entity = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = nhiemVuValue,
                                    ParentID = subHeaderId ?? masterHeaderId, // Gắn con của Dấu * nếu có, hoặc con của La Mã
                                    Level = 2,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    STT = listTrue.Count + 1
                                };
                                level2Id = level2Entity.Id;
                                level3Id = null; // Reset level 3

                                listTrue.Add(level2Entity);
                            }

                            // 4. DÒNG CÔNG VIỆC CHI TIẾT -> Cấp 3 (Con của Nhiệm vụ)
                            if (!string.IsNullOrWhiteSpace(congViecValue))
                            {
                                var level3Entity = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = congViecValue,
                                    CongViecChiTiet = congViecValue,
                                    ParentID = level2Id ?? subHeaderId ?? masterHeaderId,
                                    Level = 3,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    STT = listTrue.Count + 1
                                };
                                level3Id = level3Entity.Id;
                                listTrue.Add(level3Entity);
                            }

                            // 5. DÒNG SẢN PHẨM ĐẦU RA & ĐIỂM SỐ -> Cấp 4 (Con của Công việc chi tiết)
                            if (!string.IsNullOrWhiteSpace(sanPham) || diemVal.HasValue || heSoVal.HasValue)
                            {
                                var level4Entity = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = string.IsNullOrWhiteSpace(sanPham) ? "" : sanPham,
                                    SanPhamDauRa = sanPham,
                                    ParentID = level3Id ?? level2Id ?? subHeaderId ?? masterHeaderId,
                                    Level = 4,
                                    PhanNhom = !string.IsNullOrWhiteSpace(phanNhom) ? phanNhom : null,
                                    KhungDiemToiDa = khungDiemToiDa,
                                    Diem = diemVal,
                                    HeSoQuyDoi = heSoVal,
                                    GhiChu = ghiChuVal,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    STT = listTrue.Count + 1
                                };
                                listTrue.Add(level4Entity);
                            }

                            if (string.IsNullOrWhiteSpace(nhiemVuValue) && string.IsNullOrWhiteSpace(congViecValue) && string.IsNullOrWhiteSpace(sanPham) && !diemVal.HasValue && !heSoVal.HasValue)
                            {
                                lstFalse.Add(new
                                {
                                    row = row,
                                    reason = "Không có Tên nhiệm vụ hay Công việc chi tiết hay Sản phẩm",
                                    tenNhom = "",
                                    congViec = ""
                                });
                            }
                        }
                    }
                }
                if (listTrue.Any())
                {
                    await _kPI_NhomTieuChiService.CreateAsync(listTrue);
                }
                var syncResult = await SyncToElasticInternal(elasticClient, importedBoTieuChiDonViId);
                return DataResponse.Success(new
                {
                    listTrue = listTrue,
                    lstFalse = lstFalse,
                    totalSuccess = listTrue.Count,
                    totalFailed = lstFalse.Count
                }, syncResult.Success
                    ? "Import và đồng bộ Elastic thành công"
                    : $"Import thành công nhưng chưa đồng bộ được Elastic. {syncResult.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi import Excel trực tiếp");
                return DataResponse.False("Đã xảy ra lỗi khi đọc file Excel: " + ex.Message);
            }
        }

        [HttpPost("ImportExcelVuDonVi")]
        public async Task<DataResponse> ImportExcelVuDonVi([FromServices] ElasticsearchClient elasticClient, [FromForm] IFormFile file, [FromForm] KPI_BoTieuChiDonViImportVM data)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return DataResponse.False("Vui lòng chọn file Excel.");
                }

                if (data == null) data = new KPI_BoTieuChiDonViImportVM();
                if (data.IdDonVi == Guid.Empty && Guid.TryParse(Request.Form["IdDonVi"], out Guid dvId))
                {
                    data.IdDonVi = dvId;
                }

                var listTrue = new List<KPI_NhomTieuChi>();
                var lstFalse = new List<object>();
                KPI_BoTieuChiDonVi boTieuChiDonVi = null;

                using (var stream = file.OpenReadStream())
                {
                    using (var package = new OfficeOpenXml.ExcelPackage(stream))
                    {
                        string wsName = Request.Form["WorkSheetName"].ToString();
                        if (string.IsNullOrEmpty(wsName)) wsName = Request.Form["data.WorkSheetName"].ToString();

                        var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                        if (!string.IsNullOrEmpty(wsName))
                        {
                            var targetWs = package.Workbook.Worksheets[wsName];
                            if (targetWs != null) worksheet = targetWs;
                        }

                        if (worksheet == null || worksheet.Dimension == null)
                        {
                            return DataResponse.False("Worksheet không có dữ liệu.");
                        }

                        int rowCount = worksheet.Dimension.End.Row;
                        int colCount = worksheet.Dimension.End.Column;

                        // Local helper to read merged cells safely in EPPlus
                        string GetCellValue(int r, int c, bool emptyForMergedSubsequent = true)
                        {
                            if (c <= 0 || r <= 0 || c > colCount || r > rowCount) return "";
                            try
                            {
                                var cell = worksheet.Cells[r, c];
                                if (cell == null) return "";

                                if (cell.Merge)
                                {
                                    var mergeAddress = worksheet.MergedCells[r, c];
                                    if (!string.IsNullOrEmpty(mergeAddress))
                                    {
                                        var range = worksheet.Cells[mergeAddress];
                                        if (emptyForMergedSubsequent && (r != range.Start.Row || c != range.Start.Column))
                                        {
                                            return "";
                                        }
                                        var startCell = worksheet.Cells[range.Start.Row, range.Start.Column];
                                        string mergedText = startCell?.Text?.Trim() ?? "";
                                        if (mergedText.StartsWith("#") && (mergedText.Contains("NAME?") || mergedText.Contains("REF!") || mergedText.Contains("VALUE!") || mergedText.Contains("N/A")))
                                        {
                                            return "";
                                        }
                                        return mergedText;
                                    }
                                }

                                if (cell.Value == null) return "";
                                string rawText = cell.Text?.Trim() ?? "";
                                if (rawText.StartsWith("#") && (rawText.Contains("NAME?") || rawText.Contains("REF!") || rawText.Contains("VALUE!") || rawText.Contains("N/A")))
                                {
                                    return "";
                                }
                                return rawText;
                            }
                            catch
                            {
                                return "";
                            }
                        }

                        // 1. Quét tìm dòng tiêu đề Header của bảng
                        int headerRow = -1;
                        if (data != null && data.RowInfo.HasValue && data.RowInfo.Value > 0)
                        {
                            headerRow = data.RowInfo.Value;
                        }
                        else if (int.TryParse(Request.Form["RowInfo"], out int riForm) && riForm > 0)
                        {
                            headerRow = riForm;
                        }
                        else
                        {
                            for (int r = 1; r <= Math.Min(15, rowCount); r++)
                            {
                                int matchCount = 0;
                                for (int c = 1; c <= colCount; c++)
                                {
                                    string txt = GetCellValue(r, c, false).Trim().ToUpper();
                                    if (string.IsNullOrEmpty(txt)) continue;

                                    if (txt == "STT" || txt == "TT" || txt.Contains("SỐ TT")) matchCount++;
                                    else if (txt.Contains("NHIỆM VỤ") || txt.Contains("CÔNG VIỆC")) matchCount++;
                                    else if (txt.Contains("SẢN PHẨM") || txt.Contains("KẾT QUẢ")) matchCount++;
                                    else if (txt.Contains("ĐIỂM")) matchCount++;
                                    else if (txt.Contains("HỆ SỐ")) matchCount++;
                                }
                                if (matchCount >= 2)
                                {
                                    headerRow = r;
                                    break;
                                }
                            }
                        }

                        if (headerRow <= 0) headerRow = 3; // Fallback

                        // 2. Xác định các vị trí cột bằng tên Header
                        int colSTT1 = -1;
                        int colSTT2 = -1;
                        int colNhiemVu = -1;
                        int colCongViec = -1;
                        int colSanPham = -1;
                        int colTanSuat = -1;
                        int colTongSoNguoi = -1;
                        int colPhanNhom = -1;
                        int colKhungDiem = -1;
                        int colDiem = -1;
                        int colHeSo = -1;
                        int colGhiChu = -1;

                        for (int c = 1; c <= colCount; c++)
                        {
                            string h1 = GetCellValue(headerRow, c, false).Trim().ToUpper();
                            string hPrev = headerRow > 1 ? GetCellValue(headerRow - 1, c, false).Trim().ToUpper() : "";
                            string hName = (hPrev + " " + h1).Trim();

                            if (string.IsNullOrEmpty(hName)) continue;

                            if (h1 == "STT" || h1 == "TT" || h1 == "SỐ TT")
                            {
                                if (colSTT1 == -1) colSTT1 = c;
                                else if (colSTT2 == -1) colSTT2 = c;
                            }

                            if (hName.Contains("NHIỆM VỤ") && !hName.Contains("ĐẦU RA"))
                            {
                                colNhiemVu = c;
                            }
                            else if (hName.Contains("CÔNG VIỆC CHI TIẾT") || hName.Contains("CVCT") || (hName.Contains("CÔNG VIỆC") && !hName.Contains("NHIỆM VỤ")) || (hName.Contains("CHI TIẾT") && !hName.Contains("NHIỆM VỤ")))
                            {
                                colCongViec = c;
                            }
                            else if (hName.Contains("SẢN PHẨM") || hName.Contains("KẾT QUẢ") || hName.Contains("ĐẦU RA"))
                            {
                                colSanPham = c;
                            }
                            else if (hName.Contains("PHÂN NHÓM") || hName.Contains("NHÓM ĐỐI TƯỢNG"))
                            {
                                colPhanNhom = c;
                            }
                            else if (hName.Contains("KHUNG ĐIỂM") || hName.Contains("ĐIỂM TỐI ĐA"))
                            {
                                colKhungDiem = c;
                            }
                            else if (hName.Contains("CHẤM ĐIỂM") || hName.Contains("ĐIỂM CHẤM") || hName.Contains("ĐIỂM"))
                            {
                                if (colKhungDiem != c) colDiem = c;
                            }
                            else if (hName.Contains("HỆ SỐ") || hName.Contains("QUY ĐỔI"))
                            {
                                colHeSo = c;
                            }
                            else if (hName.Contains("GHI CHÚ") || hName.Contains("LƯU Ý"))
                            {
                                colGhiChu = c;
                            }
                            else if (hName.Contains("TẦN SUẤT") || hName.Contains("SỐ LƯỢNG"))
                            {
                                colTanSuat = c;
                            }
                            else if (hName.Contains("SỐ NGƯỜI") || hName.Contains("NGƯỜI LÀM"))
                            {
                                colTongSoNguoi = c;
                            }
                        }

                        // Smart Fallback nếu không khớp bằng tên header
                        if (colCount <= 10)
                        {
                            // Cấu trúc 9 cột chuẩn
                            if (colSTT1 <= 0) colSTT1 = 1;
                            if (colNhiemVu <= 0) colNhiemVu = 2;
                            if (colCongViec <= 0) colCongViec = 3;
                            if (colSanPham <= 0) colSanPham = 4;
                            if (colPhanNhom <= 0) colPhanNhom = 5;
                            if (colKhungDiem <= 0) colKhungDiem = 6;
                            if (colDiem <= 0) colDiem = 7;
                            if (colHeSo <= 0) colHeSo = 8;
                            if (colGhiChu <= 0) colGhiChu = 9;
                        }
                        else
                        {
                            // Cấu trúc 14 cột mở rộng
                            if (colSTT1 <= 0) colSTT1 = 1;
                            if (colSTT2 <= 0) colSTT2 = 2;
                            if (colNhiemVu <= 0) colNhiemVu = 3;
                            if (colCongViec <= 0) colCongViec = 4;
                            if (colSanPham <= 0) colSanPham = 5;
                            if (colTanSuat <= 0) colTanSuat = 6;
                            if (colTongSoNguoi <= 0) colTongSoNguoi = 7;
                            if (colPhanNhom <= 0) colPhanNhom = 8;
                            if (colKhungDiem <= 0) colKhungDiem = 11;
                            if (colDiem <= 0) colDiem = 12;
                            if (colHeSo <= 0) colHeSo = 13;
                            if (colGhiChu <= 0) colGhiChu = 14;
                        }

                        // 3. Khởi tạo / Tìm bộ tiêu chí đơn vị
                        int rowName = 1;
                        if (data != null && data.RowName.HasValue && data.RowName.Value > 0)
                        {
                            rowName = data.RowName.Value;
                        }
                        else if (int.TryParse(Request.Form["RowName"], out int rnForm) && rnForm > 0)
                        {
                            rowName = rnForm;
                        }

                        string tenDoc = GetCellValue(rowName, 2, false);
                        if (string.IsNullOrWhiteSpace(tenDoc)) tenDoc = GetCellValue(rowName, 1, false);
                        if (string.IsNullOrWhiteSpace(tenDoc)) tenDoc = "BẢNG THỐNG KÊ DANH MỤC SẢN PHẨM/CÔNG VIỆC";

                        string finalTenBoTieuChi = !string.IsNullOrWhiteSpace(data?.TenBoTieuChiDonVi) ? data.TenBoTieuChiDonVi : tenDoc;
                        string finalSoQuyetDinh = !string.IsNullOrWhiteSpace(data?.SoQuyetDinh) ? data.SoQuyetDinh : "N/A";
                        Guid? finalIdDonVi = (data != null && data.IdDonVi != Guid.Empty && data.IdDonVi != null) ? data.IdDonVi : DonViId;

                        boTieuChiDonVi = new KPI_BoTieuChiDonVi
                        {
                            Id = Guid.NewGuid(),
                            TenBoTieuChiDonVi = finalTenBoTieuChi,
                            SoQuyetDinh = finalSoQuyetDinh,
                            IdDonVi = finalIdDonVi,
                            IdDot = data?.IdDot,
                            NgayQuyetDinh = data?.NgayQuyetDinh ?? DateTime.Now,
                            ApDungTuNgay = data?.ApDungTuNgay ?? DateTime.Now,
                            ApDungToiNgay = data?.ApDungToiNgay ?? DateTime.Now.AddYears(1),
                            Is_locked = false,
                            CreatedDate = DateTime.Now
                        };
                        await _kPI_BoTieuChiDonViService.CreateAsync(boTieuChiDonVi);

                        if (boTieuChiDonVi.IdDonVi.HasValue)
                        {
                            await _kPI_BoTieuChiDonViService.SetActiveBoTieuChiDonViAsync(boTieuChiDonVi.Id, boTieuChiDonVi.IdDonVi.Value);
                        }

                        bool IsRoman(string text)
                        {
                            if (string.IsNullOrWhiteSpace(text)) return false;
                            string clean = text.Trim().TrimEnd('.');
                            return Regex.IsMatch(clean, @"^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$", RegexOptions.IgnoreCase);
                        }

                        int? ExtractInteger(string text)
                        {
                            if (string.IsNullOrWhiteSpace(text)) return null;
                            string clean = text.Replace(",", ".").Trim();
                            if (double.TryParse(clean, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double val))
                            {
                                return (int)Math.Round(val);
                            }
                            var m = Regex.Match(clean, @"\d+(\.\d+)?");
                            if (m.Success && double.TryParse(m.Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double mVal))
                            {
                                return (int)Math.Round(mVal);
                            }
                            return null;
                        }

                        // 4. Biến lưu vết phân cấp
                        Guid? level0Id = null; // Cấp 0: A. NHÓM CÔNG TÁC... / A. ĐƠN VỊ/SẢN PHẨM CÔNG VIỆC CHUẨN
                        Guid? level1Id = null; // Cấp 1: I. Xây dựng thể chế...
                        Guid? level2Id = null; // Cấp 2: Nhiệm vụ (hoặc Nhóm con)
                        Guid? level3Id = null; // Cấp 3: Công việc chi tiết

                        string lastNhiemVuText = "";
                        string lastCvctText = "";

                        int startRow = -1;
                        if (data != null && data.RowStart > 0)
                        {
                            startRow = data.RowStart;
                        }
                        else if (int.TryParse(Request.Form["RowStart"], out int rsForm) && rsForm > 0)
                        {
                            startRow = rsForm;
                        }

                        if (startRow <= 0)
                        {
                            startRow = headerRow + 1;
                        }

                        for (int row = startRow; row <= rowCount; row++)
                        {
                            string stt1 = colSTT1 > 0 ? GetCellValue(row, colSTT1, true) : "";
                            string stt2 = colSTT2 > 0 ? GetCellValue(row, colSTT2, true) : "";
                            string nhiemVu = colNhiemVu > 0 ? GetCellValue(row, colNhiemVu, true).Trim() : "";
                            string cvct = colCongViec > 0 ? GetCellValue(row, colCongViec, true).Trim() : "";
                            string sanPham = colSanPham > 0 ? GetCellValue(row, colSanPham, true).Trim() : "";
                            string phanNhom = colPhanNhom > 0 ? GetCellValue(row, colPhanNhom, false).Trim() : "";

                            // Lấy điểm, hệ số, khung điểm, ghi chú
                            int? khungDiemToiDa = colKhungDiem > 0 ? ExtractInteger(GetCellValue(row, colKhungDiem, true)) : null;
                            int? diemVal = colDiem > 0 ? ExtractInteger(GetCellValue(row, colDiem, true)) : null;
                            int? heSoVal = colHeSo > 0 ? ExtractInteger(GetCellValue(row, colHeSo, true)) : null;
                            int? ghiChuVal = colGhiChu > 0 ? ExtractInteger(GetCellValue(row, colGhiChu, false)) : null;

                            // Quét toàn bộ dòng để tìm text nếu là dòng tiêu đề merge
                            string fullRowText = "";
                            for (int c = 1; c <= colCount; c++)
                            {
                                string t = GetCellValue(row, c, false);
                                if (!string.IsNullOrWhiteSpace(t)) fullRowText += " " + t;
                            }
                            fullRowText = fullRowText.Trim();

                            if (string.IsNullOrWhiteSpace(fullRowText)) continue;

                            // Dừng nếu gặp Lưu ý / Ghi chú ở cuối file
                            string fullLower = fullRowText.ToLower();
                            if (fullLower.StartsWith("lưu ý") || fullLower.StartsWith("ghi chú")) break;

                            string sttClean = (!string.IsNullOrWhiteSpace(stt1) ? stt1 : stt2).Replace(" ", "").Trim();

                            // Bỏ qua dòng header nếu bị quét vào
                            if (sttClean == "STT" || sttClean == "TT" || nhiemVu.Equals("Nhiệm vụ", StringComparison.OrdinalIgnoreCase) ||
                                (sttClean == "1" && nhiemVu == "2" && cvct == "3"))
                            {
                                continue;
                            }

                            // =========================================================================
                            // TẦNG 0: MỤC LỚN CHỮ CÁI (A., B., C., D., Đ., E., G... hoặc A, B...)
                            // =========================================================================
                            bool isL0 = false;
                            string l0Title = "";

                            if (Regex.IsMatch(nhiemVu, @"^[A-ZĐ]\.\s*", RegexOptions.IgnoreCase))
                            {
                                isL0 = true;
                                l0Title = nhiemVu;
                            }
                            else if (Regex.IsMatch(sttClean, @"^[A-ZĐ]\.\s*", RegexOptions.IgnoreCase))
                            {
                                isL0 = true;
                                l0Title = sttClean;
                            }
                            else if (Regex.IsMatch(sttClean, @"^[A-ZĐ]$", RegexOptions.IgnoreCase) &&
                                     (nhiemVu.StartsWith("ĐƠN VỊ", StringComparison.OrdinalIgnoreCase) ||
                                      nhiemVu.StartsWith("DANH MỤC", StringComparison.OrdinalIgnoreCase) ||
                                      nhiemVu.ToUpper().Contains("CHUẨN") ||
                                      nhiemVu.ToUpper().Contains("QUY ĐỔI")))
                            {
                                isL0 = true;
                                l0Title = !nhiemVu.StartsWith(sttClean + ".", StringComparison.OrdinalIgnoreCase) ? (sttClean + ". " + nhiemVu) : nhiemVu;
                            }
                            else if (string.IsNullOrWhiteSpace(sanPham) && !diemVal.HasValue &&
                                     (nhiemVu.StartsWith("ĐƠN VỊ", StringComparison.OrdinalIgnoreCase) ||
                                      nhiemVu.StartsWith("DANH MỤC", StringComparison.OrdinalIgnoreCase) ||
                                      nhiemVu.StartsWith("NHÓM CÔNG TÁC", StringComparison.OrdinalIgnoreCase) ||
                                      nhiemVu.StartsWith("NHÓM NHIỆM VỤ", StringComparison.OrdinalIgnoreCase)))
                            {
                                isL0 = true;
                                l0Title = nhiemVu;
                            }

                            if (isL0 && string.IsNullOrWhiteSpace(sanPham) && !diemVal.HasValue)
                            {
                                var entityL0 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = l0Title,
                                    ParentID = null,
                                    Level = 0,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level0Id = entityL0.Id;
                                level1Id = null;
                                level2Id = null;
                                level3Id = null;
                                lastNhiemVuText = "";
                                lastCvctText = "";
                                listTrue.Add(entityL0);
                                continue;
                            }

                            // =========================================================================
                            // TẦNG 1: SỐ LA MÃ (I, II, III, IV, V...)
                            // =========================================================================
                            bool isRomanStt = (IsRoman(sttClean) || Regex.IsMatch(nhiemVu, @"^[IVXLCDM]+\.\s*", RegexOptions.IgnoreCase)) &&
                                              string.IsNullOrWhiteSpace(sanPham) && !diemVal.HasValue;

                            if (isRomanStt)
                            {
                                string rNum = IsRoman(sttClean) ? sttClean.TrimEnd('.') : "";
                                string rawNhiemVu = nhiemVu;
                                if (string.IsNullOrWhiteSpace(rawNhiemVu))
                                {
                                    for (int c = 2; c <= Math.Min(6, colCount); c++)
                                    {
                                        string cellVal = GetCellValue(row, c, false).Trim();
                                        if (!string.IsNullOrWhiteSpace(cellVal) && c != colSTT1 && c != colSTT2)
                                        {
                                            rawNhiemVu = cellVal;
                                            break;
                                        }
                                    }
                                }

                                if (string.IsNullOrEmpty(rNum))
                                {
                                    var mR = Regex.Match(rawNhiemVu, @"^([IVXLCDM]+)\.\s*(.*)", RegexOptions.IgnoreCase);
                                    if (mR.Success)
                                    {
                                        rNum = mR.Groups[1].Value.ToUpper();
                                        rawNhiemVu = mR.Groups[2].Value.Trim();
                                    }
                                }

                                string tenL1 = rawNhiemVu;
                                if (!string.IsNullOrEmpty(rNum))
                                {
                                    if (!tenL1.StartsWith(rNum + ".", StringComparison.OrdinalIgnoreCase) && !tenL1.StartsWith(rNum + " ", StringComparison.OrdinalIgnoreCase))
                                    {
                                        tenL1 = rNum + ". " + tenL1;
                                    }
                                }

                                if (level0Id == null)
                                {
                                    var defaultL0 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = "A. NHIỆM VỤ CHUYÊN MÔN CỦA ĐƠN VỊ",
                                        ParentID = null,
                                        Level = 0,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level0Id = defaultL0.Id;
                                    listTrue.Add(defaultL0);
                                }

                                var entityL1 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = tenL1,
                                    ParentID = level0Id,
                                    Level = 1,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level1Id = entityL1.Id;
                                level2Id = null;
                                level3Id = null;
                                lastNhiemVuText = "";
                                lastCvctText = "";
                                listTrue.Add(entityL1);
                                continue;
                            }

                            // =========================================================================
                            // TẦNG 2 HEADER: TIÊU ĐỀ NHÓM CON / NHIỆM VỤ CHA (Không có CVCT & không có Sản phẩm & không có Điểm)
                            // =========================================================================
                            bool isSubHeader = !string.IsNullOrWhiteSpace(nhiemVu) && string.IsNullOrWhiteSpace(cvct) &&
                                               string.IsNullOrWhiteSpace(sanPham) && !diemVal.HasValue;

                            if (isSubHeader)
                            {
                                if (level0Id == null)
                                {
                                    var defaultL0 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = "A. NHIỆM VỤ CHUYÊN MÔN CỦA ĐƠN VỊ",
                                        ParentID = null,
                                        Level = 0,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level0Id = defaultL0.Id;
                                    listTrue.Add(defaultL0);
                                }

                                string sttPrefix = (!string.IsNullOrWhiteSpace(sttClean) && !nhiemVu.StartsWith(sttClean + ".") && !nhiemVu.StartsWith(sttClean + " "))
                                    ? (sttClean + ". ") : "";

                                var entitySubL2 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = sttPrefix + nhiemVu,
                                    ParentID = level1Id ?? level0Id,
                                    Level = 2,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level2Id = entitySubL2.Id;
                                level3Id = null;
                                lastNhiemVuText = nhiemVu;
                                lastCvctText = "";
                                listTrue.Add(entitySubL2);
                                continue;
                            }

                            // =========================================================================
                            // DÒNG DỮ LIỆU CÔNG VIỆC / SẢN PHẨM
                            // =========================================================================
                            if (level0Id == null)
                            {
                                var defaultL0 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = "A. NHIỆM VỤ CHUYÊN MÔN CỦA ĐƠN VỊ",
                                    ParentID = null,
                                    Level = 0,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level0Id = defaultL0.Id;
                                listTrue.Add(defaultL0);
                            }

                            if (level1Id == null)
                            {
                                var defaultL1 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = "I. DANH MỤC SẢN PHẨM/CÔNG VIỆC",
                                    ParentID = level0Id,
                                    Level = 1,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level1Id = defaultL1.Id;
                                listTrue.Add(defaultL1);
                            }

                            // 1. Quản lý Level 2 (Nhiệm vụ)
                            if (!string.IsNullOrWhiteSpace(nhiemVu) && nhiemVu != lastNhiemVuText)
                            {
                                lastNhiemVuText = nhiemVu;
                                string sttPrefix = (!string.IsNullOrWhiteSpace(sttClean) && !nhiemVu.StartsWith(sttClean + ".") && !nhiemVu.StartsWith(sttClean + " "))
                                    ? (sttClean + ". ") : "";

                                var entityL2 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = sttPrefix + nhiemVu,
                                    ParentID = level1Id ?? level0Id,
                                    Level = 2,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level2Id = entityL2.Id;
                                level3Id = null;
                                lastCvctText = "";
                                listTrue.Add(entityL2);
                            }
                            else if (level2Id == null)
                            {
                                string fallbackNv = !string.IsNullOrWhiteSpace(lastNhiemVuText) ? lastNhiemVuText : (!string.IsNullOrWhiteSpace(cvct) ? cvct : (!string.IsNullOrWhiteSpace(sanPham) ? sanPham : "Nhiệm vụ"));
                                string sttPrefix = (!string.IsNullOrWhiteSpace(sttClean) && !fallbackNv.StartsWith(sttClean + ".") && !fallbackNv.StartsWith(sttClean + " "))
                                    ? (sttClean + ". ") : "";

                                var entityL2 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = sttPrefix + fallbackNv,
                                    ParentID = level1Id ?? level0Id,
                                    Level = 2,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level2Id = entityL2.Id;
                                level3Id = null;
                                listTrue.Add(entityL2);
                            }

                            // 2. Quản lý Level 3 (Công việc chi tiết)
                            if (!string.IsNullOrWhiteSpace(cvct) && cvct != lastCvctText)
                            {
                                lastCvctText = cvct;
                                var entityL3 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = cvct,
                                    CongViecChiTiet = cvct,
                                    ParentID = level2Id,
                                    Level = 3,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level3Id = entityL3.Id;
                                listTrue.Add(entityL3);
                            }
                            else if (level3Id == null)
                            {
                                string fallbackCv = !string.IsNullOrWhiteSpace(lastCvctText) ? lastCvctText : (!string.IsNullOrWhiteSpace(cvct) ? cvct : (!string.IsNullOrWhiteSpace(sanPham) ? sanPham : lastNhiemVuText));
                                var entityL3 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = fallbackCv,
                                    CongViecChiTiet = fallbackCv,
                                    ParentID = level2Id,
                                    Level = 3,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level3Id = entityL3.Id;
                                listTrue.Add(entityL3);
                            }

                            // 3. Quản lý Level 4 (Sản phẩm đầu ra, Điểm, Hệ số, Phân nhóm...)
                            var entityL4 = new KPI_NhomTieuChi
                            {
                                Id = Guid.NewGuid(),
                                TenNhomTieuChi = !string.IsNullOrWhiteSpace(sanPham) ? sanPham : (!string.IsNullOrWhiteSpace(lastCvctText) ? lastCvctText : lastNhiemVuText),
                                SanPhamDauRa = sanPham,
                                PhanNhom = phanNhom,
                                KhungDiemToiDa = khungDiemToiDa,
                                Diem = diemVal,
                                HeSoQuyDoi = heSoVal,
                                GhiChu = ghiChuVal,
                                ParentID = level3Id,
                                Level = 4,
                                IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                IdDonVi = boTieuChiDonVi.IdDonVi,
                                STT = listTrue.Count + 1
                            };
                            listTrue.Add(entityL4);
                        }
                    }
                }

                if (listTrue.Any())
                {
                    await _kPI_NhomTieuChiService.CreateAsync(listTrue);
                }

                var syncResult = await SyncToElasticInternal(elasticClient, boTieuChiDonVi.Id);

                return DataResponse.Success(new
                {
                    listTrue = listTrue,
                    lstFalse = lstFalse,
                    totalSuccess = listTrue.Count,
                    totalFailed = lstFalse.Count
                }, syncResult.Success
                    ? "Import và đồng bộ Elastic thành công"
                    : $"Import thành công nhưng chưa đồng bộ được Elastic. {syncResult.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi import Excel Vụ/Đơn vị");
                string errorMsg = ex.InnerException != null ? $"{ex.Message} ({ex.InnerException.Message})" : ex.Message;
                return DataResponse.False("Đã xảy ra lỗi khi đọc file Excel: " + errorMsg);
            }
        }

        [HttpPost("SyncToElastic")]
        public async Task<DataResponse> SyncToElastic(
            [FromServices] ElasticsearchClient elasticClient,
            [FromBody] KPI_NhomTieuChiSearch? search)
        {
            var syncResult = await SyncToElasticInternal(elasticClient, search?.IdBoTieuChiDonVi);
            if (!syncResult.Success)
            {
                return DataResponse.False(syncResult.Message);
            }

            return DataResponse.Success(new
            {
                indexedCount = syncResult.IndexedCount,
                idBoTieuChiDonVi = search?.IdBoTieuChiDonVi
            }, syncResult.Message);
        }

        private string KPI_NHOM_TIEU_CHI_ELASTIC_INDEX => _configuration["Elasticsearch:IndexNhomTieuChi"] ?? "kpi_nhomtieuchi_index";
        private const int ELASTIC_SYNC_BATCH_SIZE = 500;

        private async Task<ElasticSyncResult> SyncChangedBoTieuChiAsync(
            ElasticsearchClient elasticClient,
            Guid? previousBoTieuChiDonViId,
            Guid? currentBoTieuChiDonViId)
        {
            // Nếu tiêu chí không thuộc bộ nào thì phải đồng bộ toàn bộ để giữ Elastic nhất quán.
            if (!previousBoTieuChiDonViId.HasValue || !currentBoTieuChiDonViId.HasValue)
            {
                return await SyncToElasticInternal(elasticClient, null);
            }

            var boTieuChiDonViIds = new[] { previousBoTieuChiDonViId.Value, currentBoTieuChiDonViId.Value }
                .Distinct()
                .ToList();

            ElasticSyncResult? lastResult = null;
            foreach (var boTieuChiDonViId in boTieuChiDonViIds)
            {
                lastResult = await SyncToElasticInternal(elasticClient, boTieuChiDonViId);
                if (!lastResult.Success)
                {
                    return lastResult;
                }
            }

            return lastResult ?? ElasticSyncResult.Succeeded(0, "Không có dữ liệu cần đồng bộ Elastic");
        }

        private async Task<ElasticSyncResult> SyncToElasticInternal(
            ElasticsearchClient elasticClient,
            Guid? idBoTieuChiDonVi)
        {
            try
            {
                var success = await _kPI_NhomTieuChiService.SyncToElastic(idBoTieuChiDonVi);
                if (success)
                {
                    return ElasticSyncResult.Succeeded(0, "Đồng bộ Elastic thành công");
                }
                return ElasticSyncResult.Failed("Đồng bộ Elastic thất bại");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đồng bộ Elastic. Scope: {IdBoTieuChiDonVi}", idBoTieuChiDonVi);
                return ElasticSyncResult.Failed("Đã xảy ra lỗi khi đồng bộ Elastic");
            }
        }

        private sealed class KPI_NhomTieuChiElasticDocument
        {
            public Guid Id { get; set; }
            public string? TenNhomTieuChi { get; set; }
            public string? TenNhomTieuChiKhongDau { get; set; }
            public string? CongViecChiTiet { get; set; }
            public string? CongViecChiTietKhongDau { get; set; }
            public string? SanPhamDauRa { get; set; }
            public string? SanPhamDauRaKhongDau { get; set; }
            public string? PhanNhom { get; set; }
            public int? KhungDiemToiDa { get; set; }
            public int? Diem { get; set; }
            public int? HeSoQuyDoi { get; set; }
            public int? GhiChu { get; set; }
            public Guid? IdDonVi { get; set; }
            public Guid? ParentID { get; set; }
            public int? Level { get; set; }
            public int? STT { get; set; }
            public Guid? IdBoTieuChiDonVi { get; set; }
            public DateTime CreatedDate { get; set; }
            public DateTime UpdatedDate { get; set; }
            public string SyncVersion { get; set; } = string.Empty;
        }

        private sealed class ElasticSyncResult
        {
            public bool Success { get; private init; }
            public int IndexedCount { get; private init; }
            public string Message { get; private init; } = string.Empty;

            public static ElasticSyncResult Succeeded(int indexedCount, string message) => new()
            {
                Success = true,
                IndexedCount = indexedCount,
                Message = message
            };

            public static ElasticSyncResult Failed(string message) => new()
            {
                Success = false,
                Message = message
            };
        }
        private int GetSortOrder(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return 9999;
            text = text.Trim();
            var match = System.Text.RegularExpressions.Regex.Match(text, @"^([IVXLCDM]+|[0-9]+)[\.\s-]");
            if (match.Success)
            {
                string prefix = match.Groups[1].Value.ToUpper();
                if (int.TryParse(prefix, out int num)) return num;
                return RomanToInt(prefix);
            }
            return 9999;
        }

        private int RomanToInt(string s)
        {
            Dictionary<char, int> romanValues = new Dictionary<char, int>
            {
                {'I', 1}, {'V', 5}, {'X', 10}, {'L', 50},
                {'C', 100}, {'D', 500}, {'M', 1000}
            };
            int total = 0;
            int prevValue = 0;
            for (int i = s.Length - 1; i >= 0; i--)
            {
                if (!romanValues.ContainsKey(s[i])) return 9999;
                int value = romanValues[s[i]];
                if (value < prevValue) total -= value;
                else total += value;
                prevValue = value;
            }
            return total;
        }

        [HttpPost("ImportExcelVuDonViV2")]
        public async Task<DataResponse> ImportExcelVuDonViV2([FromServices] ElasticsearchClient elasticClient, [FromForm] IFormFile file, [FromForm] KPI_BoTieuChiDonViImportVM data)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return DataResponse.False("Vui lòng chọn file Excel.");
                }

                if (data == null) data = new KPI_BoTieuChiDonViImportVM();
                if (data.IdDonVi == Guid.Empty && Guid.TryParse(Request.Form["IdDonVi"], out Guid dvId))
                {
                    data.IdDonVi = dvId;
                }

                string importMode = data.ImportMode ?? Request.Form["importMode"].ToString();
                if (string.IsNullOrEmpty(importMode)) importMode = Request.Form["data.importMode"].ToString();
                importMode = importMode?.ToLower()?.Trim();

                var listTrue = new List<KPI_NhomTieuChi>();
                var lstFalse = new List<object>();
                KPI_BoTieuChiDonVi boTieuChiDonVi = null;

                using (var stream = file.OpenReadStream())
                {
                    using (var package = new OfficeOpenXml.ExcelPackage(stream))
                    {
                        string wsName = Request.Form["WorkSheetName"].ToString();
                        if (string.IsNullOrEmpty(wsName)) wsName = Request.Form["data.WorkSheetName"].ToString();

                        var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                        if (!string.IsNullOrEmpty(wsName))
                        {
                            var targetWs = package.Workbook.Worksheets[wsName];
                            if (targetWs != null) worksheet = targetWs;
                        }

                        // Smart fallback nếu sheet được chọn quá ít dòng (ví dụ sheet bìa Table 1 chỉ có 1 dòng)
                        if (worksheet == null || worksheet.Dimension == null || worksheet.Dimension.End.Row <= 1)
                        {
                            var validWs = package.Workbook.Worksheets.FirstOrDefault(ws => ws.Dimension != null && ws.Dimension.End.Row > 1);
                            if (validWs != null) worksheet = validWs;
                        }

                        if (worksheet == null || worksheet.Dimension == null)
                        {
                            return DataResponse.False("Worksheet không có dữ liệu.");
                        }

                        int rowCount = worksheet.Dimension.End.Row;
                        int colCount = worksheet.Dimension.End.Column;

                        // Local helper to read merged cells safely in EPPlus
                        string GetCellValue(int r, int c, bool emptyForMergedSubsequent = true)
                        {
                            if (c <= 0 || r <= 0 || c > colCount || r > rowCount) return "";
                            try
                            {
                                var cell = worksheet.Cells[r, c];
                                if (cell == null) return "";

                                if (cell.Merge)
                                {
                                    var mergeAddress = worksheet.MergedCells[r, c];
                                    if (!string.IsNullOrEmpty(mergeAddress))
                                    {
                                        var range = worksheet.Cells[mergeAddress];
                                        if (emptyForMergedSubsequent && (r != range.Start.Row || c != range.Start.Column))
                                        {
                                            return "";
                                        }
                                        var startCell = worksheet.Cells[range.Start.Row, range.Start.Column];
                                        string mergedText = startCell?.Text?.Trim() ?? "";
                                        if (mergedText.StartsWith("#") && (mergedText.Contains("NAME?") || mergedText.Contains("REF!") || mergedText.Contains("VALUE!") || mergedText.Contains("N/A")))
                                        {
                                            return "";
                                        }
                                        return mergedText;
                                    }
                                }

                                if (cell.Value == null) return "";
                                string rawText = cell.Text?.Trim() ?? "";
                                if (rawText.StartsWith("#") && (rawText.Contains("NAME?") || rawText.Contains("REF!") || rawText.Contains("VALUE!") || rawText.Contains("N/A")))
                                {
                                    return "";
                                }
                                return rawText;
                            }
                            catch
                            {
                                return "";
                            }
                        }

                        // 1. Quét tìm dòng tiêu đề Header của bảng
                        int headerRow = -1;
                        if (data != null && data.RowInfo.HasValue && data.RowInfo.Value > 0)
                        {
                            headerRow = data.RowInfo.Value;
                        }
                        else if (int.TryParse(Request.Form["RowInfo"], out int riForm) && riForm > 0)
                        {
                            headerRow = riForm;
                        }
                        else
                        {
                            for (int r = 1; r <= Math.Min(15, rowCount); r++)
                            {
                                int matchCount = 0;
                                for (int c = 1; c <= colCount; c++)
                                {
                                    string txt = GetCellValue(r, c, false).Trim().ToUpper();
                                    if (string.IsNullOrEmpty(txt)) continue;

                                    if (txt == "STT" || txt == "TT" || txt.Contains("SỐ TT")) matchCount++;
                                    else if (txt.Contains("NHIỆM VỤ") || txt.Contains("CÔNG VIỆC")) matchCount++;
                                    else if (txt.Contains("SẢN PHẨM") || txt.Contains("KẾT QUẢ")) matchCount++;
                                    else if (txt.Contains("ĐIỂM")) matchCount++;
                                    else if (txt.Contains("HỆ SỐ")) matchCount++;
                                }
                                if (matchCount >= 2)
                                {
                                    headerRow = r;
                                    break;
                                }
                            }
                        }

                        if (headerRow <= 0) headerRow = 3; 

                        int colSTT1 = 1;
                        int colSTT2 = -1;
                        int colNhiemVu = 2;
                        int colCongViec = -1;
                        int colSanPham = -1;
                        int colTanSuat = -1;
                        int colTongSoNguoi = -1;
                        int colPhanNhom = -1;
                        int colKhungDiem = -1;
                        int colDiem = -1;
                        int colHeSo = -1;
                        int colGhiChu = -1;

                        if (string.IsNullOrEmpty(importMode) || (colCount == 8 && (importMode == "vp_1917" || importMode == "van_phong_1719")))
                        {
                            string col2Header = GetCellValue(headerRow, 2, false).ToUpper();
                            string col3Header = GetCellValue(headerRow, 3, false).ToUpper();
                            string col4Header = GetCellValue(headerRow, 4, false).ToUpper();
                            string wsUpper = (wsName ?? "").ToUpper();

                            if (colCount == 8 || (col2Header.Contains("NHIỆM VỤ/SẢN PHẨM") && col3Header.Contains("CÁC SẢN PHẨM")))
                            {
                                importMode = "van_phong_bo";
                            }
                            else if (colCount == 9 && (col2Header.Contains("NHIỆM VỤ/SẢN PHẨM") || col4Header.Contains("CÁC SẢN PHẨM") || wsUpper.Contains("1719")))
                            {
                                importMode = "vp_1917";
                            }
                            else if (colCount > 10)
                            {
                                importMode = "14_cols";
                            }
                            else
                            {
                                importMode = "tccb";
                            }
                        }

                        if (importMode == "van_phong_1719" || importMode == "vp_1917" || importMode == "vp1719")
                        {
                            // =========================================================================
                            // CASE 1: VĂN PHÒNG 1719 (9 CỘT)
                            // =========================================================================
                            colSTT1 = 1;
                            colNhiemVu = 2;       // Nhiệm vụ/sản phẩm đầu ra
                            colCongViec = 3;      // Công việc chi tiết (trống trong dữ liệu)
                            colSanPham = 4;       // Các sản phẩm đầu ra
                            colPhanNhom = 5;      // Phân nhóm
                            colKhungDiem = 6;     // Khung điểm tối đa
                            colDiem = 7;          // Điểm chấm/sản phẩm
                            colHeSo = 8;          // Hệ số quy đổi
                            colGhiChu = 9;        // Ghi chú
                        }
                        else if (importMode == "van_phong_bo" || importMode == "vpb" || importMode == "8_cols")
                        {
                            // =========================================================================
                            // CASE 2: VĂN PHÒNG BỘ (8 CỘT)
                            // =========================================================================
                            colSTT1 = 1;
                            colNhiemVu = 2;       // Nhiệm vụ/sản phẩm đầu ra
                            colCongViec = -1;     // Không có cột CVCT riêng
                            colSanPham = 3;       // Các sản phẩm đầu ra
                            colPhanNhom = 4;      // Phân nhóm
                            colKhungDiem = 5;     // Khung điểm tối đa
                            colDiem = 6;          // Điểm chấm/sản phẩm
                            colHeSo = 7;          // Hệ số quy đổi
                            colGhiChu = 8;        // Ghi chú
                        }
                        else if (importMode == "14_cols" || colCount > 10)
                        {
                            colSTT1 = 1;
                            colSTT2 = 2;
                            colNhiemVu = 3;
                            colCongViec = 4;
                            colSanPham = 5;
                            colTanSuat = 6;
                            colTongSoNguoi = 7;
                            colPhanNhom = 8;
                            colKhungDiem = 11;
                            colDiem = 12;
                            colHeSo = 13;
                            colGhiChu = 14;
                        }
                        else
                        {
                            // =========================================================================
                            // CASE 3: TCCB (VỤ TỔ CHỨC CÁN BỘ & ĐƠN VỊ KHÁC - 9 CỘT CHUẨN)
                            // =========================================================================
                            colSTT1 = 1;
                            colNhiemVu = 2;       // Nhiệm vụ
                            colCongViec = 3;      // Công việc chi tiết
                            colSanPham = 4;       // Sản phẩm đầu ra
                            colPhanNhom = 5;      // Phân nhóm
                            colKhungDiem = 6;     // Khung điểm / Điểm tối đa
                            colDiem = 7;          // Điểm chấm
                            colHeSo = 8;          // Hệ số quy đổi
                            colGhiChu = 9;        // Ghi chú
                        }

                        int rowName = 1;
                        if (data != null && data.RowName.HasValue && data.RowName.Value > 0)
                        {
                            rowName = data.RowName.Value;
                        }
                        else if (int.TryParse(Request.Form["RowName"], out int rnForm) && rnForm > 0)
                        {
                            rowName = rnForm;
                        }

                        string tenDoc = GetCellValue(rowName, 2, false);
                        if (string.IsNullOrWhiteSpace(tenDoc)) tenDoc = GetCellValue(rowName, 1, false);
                        if (string.IsNullOrWhiteSpace(tenDoc)) tenDoc = "BẢNG THỐNG KÊ DANH MỤC SẢN PHẨM/CÔNG VIỆC";

                        string finalTenBoTieuChi = !string.IsNullOrWhiteSpace(data?.TenBoTieuChiDonVi) ? data.TenBoTieuChiDonVi : tenDoc;
                        string finalSoQuyetDinh = !string.IsNullOrWhiteSpace(data?.SoQuyetDinh) ? data.SoQuyetDinh : "N/A";
                        Guid? finalIdDonVi = (data != null && data.IdDonVi != Guid.Empty && data.IdDonVi != null) ? data.IdDonVi : DonViId;

                        boTieuChiDonVi = new KPI_BoTieuChiDonVi
                        {
                            Id = Guid.NewGuid(),
                            TenBoTieuChiDonVi = finalTenBoTieuChi,
                            SoQuyetDinh = finalSoQuyetDinh,
                            IdDonVi = finalIdDonVi,
                            IdDot = data?.IdDot,
                            NgayQuyetDinh = data?.NgayQuyetDinh ?? DateTime.Now,
                            ApDungTuNgay = data?.ApDungTuNgay ?? DateTime.Now,
                            ApDungToiNgay = data?.ApDungToiNgay ?? DateTime.Now.AddYears(1),
                            Is_locked = false,
                            CreatedDate = DateTime.Now
                        };
                        await _kPI_BoTieuChiDonViService.CreateAsync(boTieuChiDonVi);

                        if (boTieuChiDonVi.IdDonVi.HasValue)
                        {
                            await _kPI_BoTieuChiDonViService.SetActiveBoTieuChiDonViAsync(boTieuChiDonVi.Id, boTieuChiDonVi.IdDonVi.Value);
                        }

                        bool IsRoman(string text)
                        {
                            if (string.IsNullOrWhiteSpace(text)) return false;
                            string clean = text.Replace(".", "").Trim().ToUpper();
                            return Regex.IsMatch(clean, @"^(X{0,3})(IX|IV|V?I{1,3}|V|X)$");
                        }

                        int? ExtractInteger(string text)
                        {
                            if (string.IsNullOrWhiteSpace(text)) return null;
                            string clean = text.Replace(",", ".").Trim();
                            if (double.TryParse(clean, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double val))
                            {
                                return (int)Math.Round(val);
                            }
                            var m = Regex.Match(clean, @"\d+(\.\d+)?");
                            if (m.Success && double.TryParse(m.Value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double mVal))
                            {
                                return (int)Math.Round(mVal);
                            }
                            return null;
                        }

                        Guid? level0Id = null; 
                        Guid? level1Id = null; 
                        Guid? level2Id = null; 
                        Guid? level3Id = null; 

                        string lastNhiemVuText = "";
                        string lastCvctText = "";
                        string currentL1Num = "";
                        string currentL1Title = "";
                        int vpbSubL2Index = 0;

                        int startRow = -1;
                        if (data != null && data.RowStart > 0)
                        {
                            startRow = data.RowStart;
                        }
                        else if (int.TryParse(Request.Form["RowStart"], out int rsForm) && rsForm > 0)
                        {
                            startRow = rsForm;
                        }

                        if (startRow <= 0)
                        {
                            startRow = headerRow + 1;
                        }

                        bool hasExplicitL0 = false;
                        for (int r = startRow; r <= rowCount; r++)
                        {
                            string s1 = colSTT1 > 0 ? GetCellValue(r, colSTT1, true).Trim().Replace(" ", "") : "";
                            string s2 = colSTT2 > 0 ? GetCellValue(r, colSTT2, true).Trim().Replace(" ", "") : "";
                            string sClean = !string.IsNullOrWhiteSpace(s1) ? s1 : s2;
                            string nv = colNhiemVu > 0 ? GetCellValue(r, colNhiemVu, true).Trim() : "";

                            if (!IsRoman(sClean))
                            {
                                if (Regex.IsMatch(sClean, @"^[A-ZĐ]\.?$", RegexOptions.IgnoreCase) ||
                                    Regex.IsMatch(nv, @"^[A-ZĐ]\.\s*", RegexOptions.IgnoreCase) ||
                                    nv.StartsWith("ĐƠN VỊ", StringComparison.OrdinalIgnoreCase) ||
                                    nv.StartsWith("DANH MỤC", StringComparison.OrdinalIgnoreCase) ||
                                    nv.StartsWith("NHÓM CÔNG TÁC", StringComparison.OrdinalIgnoreCase) ||
                                    nv.StartsWith("NHÓM NHIỆM VỤ", StringComparison.OrdinalIgnoreCase))
                                {
                                    hasExplicitL0 = true;
                                    break;
                                }
                            }
                        }

                        for (int row = startRow; row <= rowCount; row++)
                        {
                            string stt1 = colSTT1 > 0 ? GetCellValue(row, colSTT1, true) : "";
                            string stt2 = colSTT2 > 0 ? GetCellValue(row, colSTT2, true) : "";
                            string nhiemVu = colNhiemVu > 0 ? GetCellValue(row, colNhiemVu, true).Trim() : "";
                            string cvct = colCongViec > 0 ? GetCellValue(row, colCongViec, true).Trim() : "";
                            string sanPham = colSanPham > 0 ? GetCellValue(row, colSanPham, true).Trim() : "";
                            string phanNhom = colPhanNhom > 0 ? GetCellValue(row, colPhanNhom, false).Trim() : "";

                            int? khungDiemToiDa = colKhungDiem > 0 ? ExtractInteger(GetCellValue(row, colKhungDiem, true)) : null;
                            int? diemVal = colDiem > 0 ? ExtractInteger(GetCellValue(row, colDiem, true)) : null;
                            int? heSoVal = colHeSo > 0 ? ExtractInteger(GetCellValue(row, colHeSo, true)) : null;
                            int? ghiChuVal = colGhiChu > 0 ? ExtractInteger(GetCellValue(row, colGhiChu, false)) : null;

                            string fullRowText = "";
                            for (int c = 1; c <= colCount; c++)
                            {
                                string t = GetCellValue(row, c, false);
                                if (!string.IsNullOrWhiteSpace(t)) fullRowText += t + " ";
                            }
                            fullRowText = fullRowText.Trim();

                            if (string.IsNullOrWhiteSpace(fullRowText)) continue;

                            string sttClean = (!string.IsNullOrWhiteSpace(stt1) ? stt1 : stt2).Replace(" ", "").Trim();

                            if (sttClean == "STT" || sttClean == "TT" || nhiemVu.Equals("Nhiệm vụ", StringComparison.OrdinalIgnoreCase) ||
                                (sttClean == "1" && nhiemVu == "2" && cvct == "3") || (sttClean == "1" && nhiemVu == "2" && sanPham == "3"))
                            {
                                continue;
                            }

                            bool isRomanCandidate = IsRoman(sttClean) || Regex.IsMatch(nhiemVu, @"^[IVXLCDM]+\.\s*", RegexOptions.IgnoreCase);
                            bool isL0 = false;
                            string l0Title = "";

                            if (!isRomanCandidate)
                            {
                                if (Regex.IsMatch(nhiemVu, @"^[A-ZĐ]\.\s*", RegexOptions.IgnoreCase))
                                {
                                    isL0 = true;
                                    l0Title = nhiemVu;
                                }
                                else if (Regex.IsMatch(sttClean, @"^[A-ZĐ]\.?$", RegexOptions.IgnoreCase))
                                {
                                    isL0 = true;
                                    l0Title = !string.IsNullOrWhiteSpace(nhiemVu) ? nhiemVu : (sttClean + ". NHIỆM VỤ CHUYÊN MÔN");
                                }
                                else if (Regex.IsMatch(sttClean, @"^[A-ZĐ]$", RegexOptions.IgnoreCase) &&
                                         (nhiemVu.StartsWith("ĐƠN VỊ", StringComparison.OrdinalIgnoreCase) ||
                                          nhiemVu.StartsWith("DANH MỤC", StringComparison.OrdinalIgnoreCase) ||
                                          nhiemVu.ToUpper().Contains("CHUẨN") ||
                                          nhiemVu.ToUpper().Contains("QUY ĐỔI")))
                                {
                                    isL0 = true;
                                    l0Title = !nhiemVu.StartsWith(sttClean + ".", StringComparison.OrdinalIgnoreCase) ? (sttClean + ". " + nhiemVu) : nhiemVu;
                                }
                                else if (string.IsNullOrWhiteSpace(sanPham) && !diemVal.HasValue &&
                                         (nhiemVu.StartsWith("ĐƠN VỊ", StringComparison.OrdinalIgnoreCase) ||
                                          nhiemVu.StartsWith("DANH MỤC", StringComparison.OrdinalIgnoreCase) ||
                                          nhiemVu.StartsWith("NHÓM CÔNG TÁC", StringComparison.OrdinalIgnoreCase) ||
                                          nhiemVu.StartsWith("NHÓM NHIỆM VỤ", StringComparison.OrdinalIgnoreCase)))
                                {
                                    isL0 = true;
                                    l0Title = nhiemVu;
                                }
                            }

                            if (isL0 && string.IsNullOrWhiteSpace(sanPham) && !diemVal.HasValue)
                            {
                                var entityL0 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = l0Title,
                                    ParentID = null,
                                    Level = 0,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level0Id = entityL0.Id;
                                level1Id = null;
                                level2Id = null;
                                level3Id = null;
                                lastNhiemVuText = "";
                                lastCvctText = "";
                                currentL1Num = "";
                                currentL1Title = "";
                                vpbSubL2Index = 0;
                                listTrue.Add(entityL0);
                                continue;
                            }

                            bool isRomanStt = isRomanCandidate && string.IsNullOrWhiteSpace(sanPham) && !diemVal.HasValue;

                            if (isRomanStt)
                            {
                                string rNum = IsRoman(sttClean) ? sttClean.TrimEnd('.') : "";
                                string rawNhiemVu = nhiemVu;
                                if (string.IsNullOrWhiteSpace(rawNhiemVu))
                                {
                                    for (int c = 2; c <= Math.Min(6, colCount); c++)
                                    {
                                        string cellVal = GetCellValue(row, c, false).Trim();
                                        if (!string.IsNullOrWhiteSpace(cellVal) && c != colSTT1 && c != colSTT2)
                                        {
                                            rawNhiemVu = cellVal;
                                            break;
                                        }
                                    }
                                }

                                if (string.IsNullOrEmpty(rNum))
                                {
                                    var mR = Regex.Match(rawNhiemVu, @"^([IVXLCDM]+)\.\s*(.*)", RegexOptions.IgnoreCase);
                                    if (mR.Success)
                                    {
                                        rNum = mR.Groups[1].Value.ToUpper();
                                        rawNhiemVu = mR.Groups[2].Value.Trim();
                                    }
                                }

                                string tenRoman = rawNhiemVu;
                                if (!string.IsNullOrEmpty(rNum))
                                {
                                    if (!tenRoman.StartsWith(rNum + ".", StringComparison.OrdinalIgnoreCase) && !tenRoman.StartsWith(rNum + " ", StringComparison.OrdinalIgnoreCase))
                                    {
                                        tenRoman = rNum + ". " + tenRoman;
                                    }
                                }

                                if (!hasExplicitL0)
                                {
                                    var entityL0 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = tenRoman,
                                        ParentID = null,
                                        Level = 0,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level0Id = entityL0.Id;
                                    level1Id = null;
                                    level2Id = null;
                                    level3Id = null;
                                    lastNhiemVuText = "";
                                    lastCvctText = "";
                                    listTrue.Add(entityL0);
                                    continue;
                                }
                                else
                                {
                                    if (level0Id == null)
                                    {
                                        var defaultL0 = new KPI_NhomTieuChi
                                        {
                                            Id = Guid.NewGuid(),
                                            TenNhomTieuChi = "A. NHIỆM VỤ CHUYÊN MÔN CỦA ĐƠN VỊ",
                                            ParentID = null,
                                            Level = 0,
                                            IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                            IdDonVi = boTieuChiDonVi.IdDonVi,
                                            STT = listTrue.Count + 1
                                        };
                                        level0Id = defaultL0.Id;
                                        listTrue.Add(defaultL0);
                                    }

                                    var entityL1 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = tenRoman,
                                        ParentID = level0Id,
                                        Level = 1,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level1Id = entityL1.Id;
                                    level2Id = null;
                                    level3Id = null;
                                    lastNhiemVuText = "";
                                    lastCvctText = "";
                                    listTrue.Add(entityL1);
                                    continue;
                                }
                            }

                            if (level0Id == null)
                            {
                                var defaultL0 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = "A. NHIỆM VỤ CHUYÊN MÔN CỦA ĐƠN VỊ",
                                    ParentID = null,
                                    Level = 0,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level0Id = defaultL0.Id;
                                listTrue.Add(defaultL0);
                            }

                            bool hasScoreOrProduct = !string.IsNullOrWhiteSpace(sanPham) || diemVal.HasValue;

                            // TẦNG 1: SỐ NGUYÊN (1, 2, 3...) KHÔNG CÓ ĐIỂM/SẢN PHẨM -> DROPDOWN (Level 1)
                            if (!hasScoreOrProduct && Regex.IsMatch(sttClean, @"^\d+$"))
                            {
                                string sttPrefix = (!nhiemVu.StartsWith(sttClean + ".") && !nhiemVu.StartsWith(sttClean + " ")) ? (sttClean + ". ") : "";
                                var entityL1 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = sttPrefix + nhiemVu,
                                    ParentID = level0Id,
                                    Level = 1,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                level1Id = entityL1.Id;
                                level2Id = null;
                                level3Id = null;
                                lastNhiemVuText = "";
                                lastCvctText = "";
                                currentL1Num = sttClean;
                                currentL1Title = nhiemVu;
                                vpbSubL2Index = 0;
                                listTrue.Add(entityL1);
                                continue;
                            }

                            if (importMode == "van_phong_1719" || importMode == "vp_1917" || importMode == "vp1719")
                            {
                                // =========================================================================
                                // CASE 1: VĂN PHÒNG 1719
                                // - 1.1 là Nhiệm vụ (Level 2)
                                // - CVCT (Level 3) tương ứng với cột Nhiệm vụ/sản phẩm đầu ra (Cột 2)
                                // - Sản phẩm đầu ra (Level 4) là cột Các sản phẩm đầu ra (Cột 4)
                                // =========================================================================
                                if (!hasScoreOrProduct)
                                {
                                    if (Regex.IsMatch(sttClean, @"^\d+\.\d+"))
                                    {
                                        string sttPrefix = (!nhiemVu.StartsWith(sttClean + ".") && !nhiemVu.StartsWith(sttClean + " ")) ? (sttClean + ". ") : "";
                                        var entityL2 = new KPI_NhomTieuChi
                                        {
                                            Id = Guid.NewGuid(),
                                            TenNhomTieuChi = sttPrefix + nhiemVu,
                                            ParentID = level1Id ?? level0Id,
                                            Level = 2,
                                            IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                            IdDonVi = boTieuChiDonVi.IdDonVi,
                                            STT = listTrue.Count + 1
                                        };
                                        level2Id = entityL2.Id;
                                        level3Id = null;
                                        lastNhiemVuText = nhiemVu;
                                        lastCvctText = "";
                                        listTrue.Add(entityL2);
                                        continue;
                                    }
                                    else if (!string.IsNullOrWhiteSpace(nhiemVu))
                                    {
                                        vpbSubL2Index++;
                                        string autoPrefix = !string.IsNullOrEmpty(currentL1Num) ? $"{currentL1Num}.{vpbSubL2Index}. " : "";
                                        string l2Name = nhiemVu;
                                        if (!string.IsNullOrEmpty(autoPrefix) && !l2Name.StartsWith(autoPrefix) && !Regex.IsMatch(l2Name, @"^\d+\.\d+"))
                                        {
                                            l2Name = autoPrefix + l2Name;
                                        }

                                        var entitySubL2 = new KPI_NhomTieuChi
                                        {
                                            Id = Guid.NewGuid(),
                                            TenNhomTieuChi = l2Name,
                                            ParentID = level1Id ?? level0Id,
                                            Level = 2,
                                            IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                            IdDonVi = boTieuChiDonVi.IdDonVi,
                                            STT = listTrue.Count + 1
                                        };
                                        level2Id = entitySubL2.Id;
                                        level3Id = null;
                                        lastNhiemVuText = nhiemVu;
                                        lastCvctText = "";
                                        listTrue.Add(entitySubL2);
                                        continue;
                                    }
                                }

                                if (level2Id == null)
                                {
                                    var defaultL2 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = "Nhiệm vụ",
                                        ParentID = level1Id ?? level0Id,
                                        Level = 2,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level2Id = defaultL2.Id;
                                    level3Id = null;
                                    listTrue.Add(defaultL2);
                                }

                                // Level 3: Công việc chi tiết tương ứng với Nhiệm vụ/sản phẩm đầu ra (Cột 2)
                                string effectiveCvct = !string.IsNullOrWhiteSpace(nhiemVu) ? nhiemVu : (!string.IsNullOrWhiteSpace(sanPham) ? sanPham : "Công việc chi tiết");
                                if (!level3Id.HasValue || effectiveCvct != lastCvctText)
                                {
                                    lastCvctText = effectiveCvct;
                                    var entityL3 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = effectiveCvct,
                                        CongViecChiTiet = effectiveCvct,
                                        ParentID = level2Id,
                                        Level = 3,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level3Id = entityL3.Id;
                                    listTrue.Add(entityL3);
                                }

                                // Level 4: Sản phẩm đầu ra là cột Các sản phẩm đầu ra (Cột 4)
                                string effectiveSp = !string.IsNullOrWhiteSpace(sanPham) ? sanPham : nhiemVu;
                                var entityL4 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = effectiveSp,
                                    SanPhamDauRa = effectiveSp,
                                    PhanNhom = phanNhom,
                                    KhungDiemToiDa = khungDiemToiDa,
                                    Diem = diemVal,
                                    HeSoQuyDoi = heSoVal,
                                    GhiChu = ghiChuVal,
                                    ParentID = level3Id.Value,
                                    Level = 4,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                listTrue.Add(entityL4);
                            }
                            else if (importMode == "van_phong_bo" || importMode == "vpb" || importMode == "8_cols")
                            {
                                // =========================================================================
                                // CASE 2: VĂN PHÒNG BỘ (8 CỘT)
                                // =========================================================================
                                if (!hasScoreOrProduct)
                                {
                                    if (!string.IsNullOrWhiteSpace(nhiemVu))
                                    {
                                        vpbSubL2Index++;
                                        string autoPrefix = !string.IsNullOrEmpty(currentL1Num) ? $"{currentL1Num}.{vpbSubL2Index}. " : "";
                                        string l2Name = nhiemVu;
                                        if (!string.IsNullOrEmpty(autoPrefix) && !l2Name.StartsWith(autoPrefix) && !Regex.IsMatch(l2Name, @"^\d+\.\d+"))
                                        {
                                            l2Name = autoPrefix + l2Name;
                                        }

                                        var entityL2 = new KPI_NhomTieuChi
                                        {
                                            Id = Guid.NewGuid(),
                                            TenNhomTieuChi = l2Name,
                                            ParentID = level1Id ?? level0Id,
                                            Level = 2,
                                            IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                            IdDonVi = boTieuChiDonVi.IdDonVi,
                                            STT = listTrue.Count + 1
                                        };
                                        level2Id = entityL2.Id;
                                        level3Id = null;
                                        lastNhiemVuText = nhiemVu;
                                        lastCvctText = "";
                                        listTrue.Add(entityL2);
                                        continue;
                                    }
                                }

                                if (level2Id == null)
                                {
                                    vpbSubL2Index++;
                                    string autoPrefix = !string.IsNullOrEmpty(currentL1Num) ? $"{currentL1Num}.{vpbSubL2Index}. " : "";
                                    string l2Title = !string.IsNullOrEmpty(currentL1Title) ? $"{autoPrefix}{currentL1Title}" : "Nhiệm vụ";
                                    var defaultL2 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = l2Title,
                                        ParentID = level1Id ?? level0Id,
                                        Level = 2,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level2Id = defaultL2.Id;
                                    level3Id = null;
                                    listTrue.Add(defaultL2);
                                }

                                string effectiveCvct = !string.IsNullOrWhiteSpace(nhiemVu) ? nhiemVu : (!string.IsNullOrWhiteSpace(sanPham) ? sanPham : "Công việc chi tiết");
                                if (!level3Id.HasValue || effectiveCvct != lastCvctText)
                                {
                                    lastCvctText = effectiveCvct;
                                    var entityL3 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = effectiveCvct,
                                        CongViecChiTiet = effectiveCvct,
                                        ParentID = level2Id,
                                        Level = 3,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level3Id = entityL3.Id;
                                    listTrue.Add(entityL3);
                                }

                                string effectiveSp = !string.IsNullOrWhiteSpace(sanPham) ? sanPham : nhiemVu;
                                var entityL4 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = effectiveSp,
                                    SanPhamDauRa = effectiveSp,
                                    PhanNhom = phanNhom,
                                    KhungDiemToiDa = khungDiemToiDa,
                                    Diem = diemVal,
                                    HeSoQuyDoi = heSoVal,
                                    GhiChu = ghiChuVal,
                                    ParentID = level3Id.Value,
                                    Level = 4,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                listTrue.Add(entityL4);
                            }
                            else
                            {
                                // =========================================================================
                                // CASE 3: TCCB (VỤ TỔ CHỨC CÁN BỘ & ĐƠN VỊ KHÁC - 9 CỘT CHUẨN)
                                // =========================================================================
                                if (!hasScoreOrProduct && !string.IsNullOrWhiteSpace(nhiemVu) && string.IsNullOrWhiteSpace(cvct))
                                {
                                    string sttPrefix = (!string.IsNullOrWhiteSpace(sttClean) && !nhiemVu.StartsWith(sttClean + ".") && !nhiemVu.StartsWith(sttClean + " ")) ? (sttClean + ". ") : "";
                                    var entitySubL2 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = sttPrefix + nhiemVu,
                                        ParentID = level1Id ?? level0Id,
                                        Level = 2,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level2Id = entitySubL2.Id;
                                    level3Id = null;
                                    lastNhiemVuText = nhiemVu;
                                    lastCvctText = "";
                                    listTrue.Add(entitySubL2);
                                    continue;
                                }

                                if (!string.IsNullOrWhiteSpace(nhiemVu) && nhiemVu != lastNhiemVuText)
                                {
                                    lastNhiemVuText = nhiemVu;
                                    string sttPrefix = (!string.IsNullOrWhiteSpace(sttClean) && !nhiemVu.StartsWith(sttClean + ".") && !nhiemVu.StartsWith(sttClean + " ")) ? (sttClean + ". ") : "";
                                    var entityL2 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = sttPrefix + nhiemVu,
                                        ParentID = level1Id ?? level0Id,
                                        Level = 2,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level2Id = entityL2.Id;
                                    level3Id = null;
                                    lastCvctText = "";
                                    listTrue.Add(entityL2);
                                }
                                else if (level2Id == null)
                                {
                                    string fallbackNv = !string.IsNullOrWhiteSpace(lastNhiemVuText) ? lastNhiemVuText : (!string.IsNullOrWhiteSpace(cvct) ? cvct : (!string.IsNullOrWhiteSpace(sanPham) ? sanPham : "Nhiệm vụ"));
                                    string sttPrefix = (!string.IsNullOrWhiteSpace(sttClean) && !fallbackNv.StartsWith(sttClean + ".") && !fallbackNv.StartsWith(sttClean + " ")) ? (sttClean + ". ") : "";
                                    var entityL2 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = sttPrefix + fallbackNv,
                                        ParentID = level1Id ?? level0Id,
                                        Level = 2,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level2Id = entityL2.Id;
                                    level3Id = null;
                                    listTrue.Add(entityL2);
                                }

                                if (!string.IsNullOrWhiteSpace(cvct) && cvct != lastCvctText)
                                {
                                    lastCvctText = cvct;
                                    var entityL3 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = cvct,
                                        CongViecChiTiet = cvct,
                                        ParentID = level2Id,
                                        Level = 3,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level3Id = entityL3.Id;
                                    listTrue.Add(entityL3);
                                }
                                else if (level3Id == null)
                                {
                                    string fallbackCv = !string.IsNullOrWhiteSpace(lastCvctText) ? lastCvctText : (!string.IsNullOrWhiteSpace(cvct) ? cvct : (!string.IsNullOrWhiteSpace(sanPham) ? sanPham : lastNhiemVuText));
                                    var entityL3 = new KPI_NhomTieuChi
                                    {
                                        Id = Guid.NewGuid(),
                                        TenNhomTieuChi = fallbackCv,
                                        CongViecChiTiet = fallbackCv,
                                        ParentID = level2Id,
                                        Level = 3,
                                        IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                        IdDonVi = boTieuChiDonVi.IdDonVi,
                                        STT = listTrue.Count + 1
                                    };
                                    level3Id = entityL3.Id;
                                    listTrue.Add(entityL3);
                                }

                                var entityL4 = new KPI_NhomTieuChi
                                {
                                    Id = Guid.NewGuid(),
                                    TenNhomTieuChi = !string.IsNullOrWhiteSpace(sanPham) ? sanPham : (!string.IsNullOrWhiteSpace(lastCvctText) ? lastCvctText : lastNhiemVuText),
                                    SanPhamDauRa = sanPham,
                                    PhanNhom = phanNhom,
                                    KhungDiemToiDa = khungDiemToiDa,
                                    Diem = diemVal,
                                    HeSoQuyDoi = heSoVal,
                                    GhiChu = ghiChuVal,
                                    ParentID = level3Id,
                                    Level = 4,
                                    IdBoTieuChiDonVi = boTieuChiDonVi.Id,
                                    IdDonVi = boTieuChiDonVi.IdDonVi,
                                    STT = listTrue.Count + 1
                                };
                                listTrue.Add(entityL4);
                            }
                        }
                    }
                }

                if (listTrue.Any())
                {
                    await _kPI_NhomTieuChiService.CreateAsync(listTrue);
                }

                var syncResult = await SyncToElasticInternal(elasticClient, boTieuChiDonVi.Id);

                return DataResponse.Success(new
                {
                    listTrue = listTrue,
                    lstFalse = lstFalse,
                    totalSuccess = listTrue.Count,
                    totalFailed = lstFalse.Count
                }, syncResult.Success
                    ? "Import và đồng bộ Elastic thành công"
                    : $"Import thành công nhưng chưa đồng bộ được Elastic. {syncResult.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi import Excel Vụ/Đơn vị v2");
                string errorMsg = ex.InnerException != null ? $"{ex.Message} ({ex.InnerException.Message})" : ex.Message;
                return DataResponse.False("Đã xảy ra lỗi khi đọc file Excel: " + errorMsg);
            }
        }

        public class HierarchicalNumberComparer : System.Collections.Generic.IComparer<string>
        {
            public int Compare(string? x, string? y)
            {
                if (string.IsNullOrWhiteSpace(x) && string.IsNullOrWhiteSpace(y)) return 0;
                if (string.IsNullOrWhiteSpace(x)) return 1;
                if (string.IsNullOrWhiteSpace(y)) return -1;

                var keysX = GetSortKeys(x);
                var keysY = GetSortKeys(y);

                bool hasNumX = keysX.Count > 0 && keysX[0].AsInt != 9999;
                bool hasNumY = keysY.Count > 0 && keysY[0].AsInt != 9999;

                if (hasNumX && !hasNumY) return -1;
                if (!hasNumX && hasNumY) return 1;

                int len = Math.Max(keysX.Count, keysY.Count);
                for (int i = 0; i < len; i++)
                {
                    if (i >= keysX.Count) return -1;
                    if (i >= keysY.Count) return 1;

                    var valX = keysX[i];
                    var valY = keysY[i];

                    if (valX.IsNumeric && valY.IsNumeric)
                    {
                        if (valX.AsInt != valY.AsInt)
                            return valX.AsInt.CompareTo(valY.AsInt);
                    }
                    else
                    {
                        int comp = string.Compare(valX.AsString, valY.AsString, StringComparison.OrdinalIgnoreCase);
                        if (comp != 0) return comp;
                    }
                }

                return 0;
            }

            private struct SortKey
            {
                public bool IsNumeric { get; set; }
                public int AsInt { get; set; }
                public string AsString { get; set; }
            }

            private List<SortKey> GetSortKeys(string text)
            {
                text = text.Trim();
                // Match prefix like "1.1.1.", "II.1.", "A.b.", etc. at the start of string
                var match = System.Text.RegularExpressions.Regex.Match(text, @"^([A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*)(?:\.|\s|-|:|$)");
                if (!match.Success)
                {
                    return new List<SortKey> { new SortKey { IsNumeric = true, AsInt = 9999, AsString = text } };
                }

                var prefix = match.Groups[1].Value;
                var segments = prefix.Split('.');
                var result = new List<SortKey>();

                foreach (var seg in segments)
                {
                    var trimmed = seg.Trim().ToUpper();
                    if (int.TryParse(trimmed, out int num))
                    {
                        result.Add(new SortKey { IsNumeric = true, AsInt = num });
                    }
                    else if (System.Text.RegularExpressions.Regex.IsMatch(trimmed, "^[IVXLCDM]+$"))
                    {
                        result.Add(new SortKey { IsNumeric = true, AsInt = RomanToInt(trimmed) });
                    }
                    else if (trimmed.Length == 1 && trimmed[0] >= 'A' && trimmed[0] <= 'Z')
                    {
                        result.Add(new SortKey { IsNumeric = true, AsInt = trimmed[0] - 'A' + 1 });
                    }
                    else
                    {
                        result.Add(new SortKey { IsNumeric = false, AsString = trimmed });
                    }
                }

                return result;
            }

            private int RomanToInt(string s)
            {
                var romanValues = new Dictionary<char, int>
            {
                {'I', 1}, {'V', 5}, {'X', 10}, {'L', 50},
                {'C', 100}, {'D', 500}, {'M', 1000}
            };
                int total = 0;
                int prevValue = 0;
                for (int i = s.Length - 1; i >= 0; i--)
                {
                    if (!romanValues.ContainsKey(s[i])) return 9999;
                    int value = romanValues[s[i]];
                    if (value < prevValue) total -= value;
                    else total += value;
                    prevValue = value;
                }
                return total;
            }
        }
    }

}

