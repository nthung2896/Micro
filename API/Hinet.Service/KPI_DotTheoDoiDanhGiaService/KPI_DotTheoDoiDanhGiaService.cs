using Hinet.Model.Entities;
using Hinet.Repository.KPI_DotTheoDoiDanhGiaRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_DotTheoDoiDanhGiaService.Dto;
using Hinet.Service.KPI_DotTheoDoiDanhGiaService.Request;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Hinet.Service.Constant;
using Microsoft.EntityFrameworkCore;
using Hinet.Repository.KPI_BoTieuChiChungRepository;
using Hinet.Repository.KPI_BoTieuChiDonViRepository;

using Hinet.Repository.KPI_DotDanhGia_DonViRepository;
using Hinet.Service.Core.Mapper;

namespace Hinet.Service.KPI_DotTheoDoiDanhGiaService
{
    public class KPI_DotTheoDoiDanhGiaService : Service<KPI_DotTheoDoiDanhGia>, IKPI_DotTheoDoiDanhGiaService
    {
        private readonly IKPI_BoTieuChiChungRepository _boTieuChiChungRepository;
        private readonly IKPI_BoTieuChiDonViRepository _boTieuChiDonViRepository;
        private readonly IKPI_DotDanhGia_DonViRepository _dotDanhGiaDonViRepository;
        private readonly IMapper _mapper;

        public KPI_DotTheoDoiDanhGiaService(
            IKPI_DotTheoDoiDanhGiaRepository kPI_DotTheoDoiDanhGiaRepository,
            IKPI_BoTieuChiChungRepository boTieuChiChungRepository,
            IKPI_BoTieuChiDonViRepository boTieuChiDonViRepository,
            IKPI_DotDanhGia_DonViRepository dotDanhGiaDonViRepository,
            IMapper mapper
            ) : base(kPI_DotTheoDoiDanhGiaRepository)
        {
            _boTieuChiChungRepository = boTieuChiChungRepository;
            _boTieuChiDonViRepository = boTieuChiDonViRepository;
            _dotDanhGiaDonViRepository = dotDanhGiaDonViRepository;
            _mapper = mapper;
        }

        public async Task<PagedList<KPI_DotTheoDoiDanhGiaDto>> GetData(KPI_DotTheoDoiDanhGiaSearch search)
        {
            var query = from q in GetQueryable()
                        join btcChungGroupObj in _boTieuChiChungRepository.GetQueryable() on q.DefaultTieuChiChung equals btcChungGroupObj.Id into btcChungGroup from btcChung in btcChungGroup.DefaultIfEmpty()
                        join btcDonViGroupObj in _boTieuChiDonViRepository.GetQueryable() on q.DefaultTieuChiDonVi equals btcDonViGroupObj.Id into btcDonViGroup from btcDonVi in btcDonViGroup.DefaultIfEmpty()
                        select new KPI_DotTheoDoiDanhGiaDto()
                        {
                            TenDotTheoDoiDanhGia = q.TenDotTheoDoiDanhGia,
                            Thang = q.Thang,
                            Quy = q.Quy,
                            Nam = q.Nam,
                            ThoiGianBatDau = q.ThoiGianBatDau,
                            ThoiGianKetThuc = q.ThoiGianKetThuc,
                            Type = q.Type,
                            TrangThai = q.TrangThai,
                            DefaultTieuChiChung = q.DefaultTieuChiChung,
                            DefaultTieuChiDonVi = q.DefaultTieuChiDonVi,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                            DefaultTieuChiChungName = btcChung != null ? btcChung.TenBoTieuChiDonVi : null,
                            DefaultTieuChiDonViName = btcDonVi != null ? btcDonVi.TenBoTieuChiDonVi : null

                        };
            if(search != null )
            {
                if(!string.IsNullOrEmpty(search.TenDotTheoDoiDanhGia))
				{
					query = query.Where(x => EF.Functions.Like(x.TenDotTheoDoiDanhGia, $"%{search.TenDotTheoDoiDanhGia}%"));
				}
                if (search.Thang.HasValue)
                {
                    query = query.Where(x => x.Thang == search.Thang.Value);
                }
                if (search.Quy.HasValue)
                {
                    query = query.Where(x => x.Quy == search.Quy.Value);
                }
                if (search.Nam.HasValue)
                {
                    query = query.Where(x => x.Nam == search.Nam.Value);
                }
                if (search.ThoiGianBatDauFrom.HasValue)
                {
                    query = query.Where(x => x.ThoiGianBatDau >= search.ThoiGianBatDauFrom.Value);
                }
                if (search.ThoiGianBatDauTo.HasValue)
                {
                    query = query.Where(x => x.ThoiGianBatDau <= search.ThoiGianBatDauTo.Value.AddDays(1).AddSeconds(-1));
                }
                if (search.ThoiGianKetThucFrom.HasValue)
                {
                    query = query.Where(x => x.ThoiGianKetThuc >= search.ThoiGianKetThucFrom.Value);
                }
                if (search.ThoiGianKetThucTo.HasValue)
                {
                    query = query.Where(x => x.ThoiGianKetThuc <= search.ThoiGianKetThucTo.Value.AddDays(1).AddSeconds(-1));
                }
                if (!string.IsNullOrEmpty(search.Type))
                {
                    if (search.Type == LoaiDotDanhGiaConstant.TAP_THE || search.Type == "TapThe")
                    {
                        query = query.Where(x => x.Type == LoaiDotDanhGiaConstant.TAP_THE
                                              || x.Type == "TapThe"
                                              || (x.Type == null && x.TenDotTheoDoiDanhGia != null && EF.Functions.ILike(x.TenDotTheoDoiDanhGia, "%tập thể%")));
                    }
                    else
                    {
                        query = query.Where(x => (x.Type == search.Type || (x.Type == null && (x.TenDotTheoDoiDanhGia == null || !EF.Functions.ILike(x.TenDotTheoDoiDanhGia, "%tập thể%"))))
                                              && x.Type != LoaiDotDanhGiaConstant.TAP_THE
                                              && x.Type != "TapThe"
                                              && (x.TenDotTheoDoiDanhGia == null || !EF.Functions.ILike(x.TenDotTheoDoiDanhGia, "%tập thể%")));
                    }
                }
                if (!string.IsNullOrEmpty(search.TrangThai))
                {
                    query = query.Where(x => EF.Functions.Like(x.TrangThai, $"%{search.TrangThai}%"));
                }
            }
            query = query.OrderByDescending(x=>x.CreatedDate);
            var result = await PagedList<KPI_DotTheoDoiDanhGiaDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_DotTheoDoiDanhGiaDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                              join btcChungGroupObj in _boTieuChiChungRepository.GetQueryable() on q.DefaultTieuChiChung equals btcChungGroupObj.Id into btcChungGroup from btcChung in btcChungGroup.DefaultIfEmpty()
                              join btcDonViGroupObj in _boTieuChiDonViRepository.GetQueryable() on q.DefaultTieuChiDonVi equals btcDonViGroupObj.Id into btcDonViGroup from btcDonVi in btcDonViGroup.DefaultIfEmpty()
                              select new KPI_DotTheoDoiDanhGiaDto()
                        {
                            TenDotTheoDoiDanhGia = q.TenDotTheoDoiDanhGia,
                            Thang = q.Thang,
                            Quy = q.Quy,
                            Nam = q.Nam,
                            ThoiGianBatDau = q.ThoiGianBatDau,
                            ThoiGianKetThuc = q.ThoiGianKetThuc,
                            Type = q.Type,
                            TrangThai = q.TrangThai,
                            DefaultTieuChiChung = q.DefaultTieuChiChung,
                            DefaultTieuChiDonVi = q.DefaultTieuChiDonVi,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                            DefaultTieuChiChungName = btcChung != null ? btcChung.TenBoTieuChiDonVi : null,
                            DefaultTieuChiDonViName = btcDonVi != null ? btcDonVi.TenBoTieuChiDonVi : null
                        }).FirstOrDefaultAsync();
            
            return item;
        }

        public async Task<List<DropdownOption>> GetDropdownDotDanhGia(bool activeOnly = false, string? type = null)
        {
            var query = GetQueryable();
            if (activeOnly)
            {
                query = query.Where(x => x.TrangThai == TrangThaiDotDanhGiaConstant.ACTIVE || x.TrangThai == "Đang hoạt động");
            }

            if (!string.IsNullOrEmpty(type))
            {
                if (type == LoaiDotDanhGiaConstant.TAP_THE || type == "TapThe")
                {
                    query = query.Where(x => x.Type == LoaiDotDanhGiaConstant.TAP_THE
                                          || x.Type == "TapThe"
                                          || (x.Type == null && x.TenDotTheoDoiDanhGia != null && EF.Functions.ILike(x.TenDotTheoDoiDanhGia, "%tập thể%")));
                }
                else
                {
                    query = query.Where(x => (x.Type == type || (x.Type == null && (x.TenDotTheoDoiDanhGia == null || !EF.Functions.ILike(x.TenDotTheoDoiDanhGia, "%tập thể%"))))
                                          && x.Type != LoaiDotDanhGiaConstant.TAP_THE
                                          && x.Type != "TapThe"
                                          && (x.TenDotTheoDoiDanhGia == null || !EF.Functions.ILike(x.TenDotTheoDoiDanhGia, "%tập thể%")));
                }
            }

            var rawData = await query
                .Select(x => new
                {
                    x.Id,
                    x.Thang,
                    x.Nam,
                    x.TenDotTheoDoiDanhGia,
                    x.TrangThai,
                    x.ThoiGianBatDau,
                    x.CreatedDate
                }).ToListAsync();

            var data = rawData
                .OrderBy(x => (x.TrangThai == TrangThaiDotDanhGiaConstant.ACTIVE || x.TrangThai == "Đang hoạt động") ? 0 : 1)
                .ThenByDescending(x => x.ThoiGianBatDau ?? x.CreatedDate)
                .ThenByDescending(x => x.CreatedDate)
                .Select(x =>
            {
                string baseLabel = string.IsNullOrEmpty(x.TenDotTheoDoiDanhGia) 
                    ? $"Tháng {x.Thang} Năm {x.Nam}" 
                    : x.TenDotTheoDoiDanhGia;

                string trangThaiTxt = (x.TrangThai == TrangThaiDotDanhGiaConstant.ACTIVE || x.TrangThai == "Đang hoạt động")
                    ? "Đang hoạt động"
                    : (x.TrangThai == TrangThaiDotDanhGiaConstant.CLOSED || x.TrangThai == "Đã đóng/Kết thúc" || x.TrangThai == "Đã đóng" ? "Đã đóng" : (x.TrangThai ?? ""));

                string labelWithStatus = !string.IsNullOrEmpty(trangThaiTxt)
                    ? $"{baseLabel} ({trangThaiTxt})"
                    : baseLabel;

                return new DropdownOption()
                {
                    Value = x.Id.ToString(),
                    Label = labelWithStatus
                };
            }).ToList();

            return data;
        }

        public async Task<CreateCurrentMonthIfMissingResult> CreateCurrentMonthIfMissingAsync(
            DateTime currentTime,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var month = currentTime.Month;
            var year = currentTime.Year;

            var alreadyExists = await GetQueryable()
                .AnyAsync(x => x.Thang == month && x.Nam == year, cancellationToken);

            if (alreadyExists)
            {
                return CreateCurrentMonthIfMissingResult.AlreadyExists();
            }

            var commonCriteriaIds = await _boTieuChiChungRepository.GetQueryable()
                .Where(x => !x.IsDeleted && x.IsActive == true)
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);

            var unitCriteriaIds = await _boTieuChiDonViRepository.GetQueryable()
                .Where(x => !x.IsDeleted && !x.Is_locked)
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);

            var missingCommonCriteria = commonCriteriaIds.Count == 0;
            var missingUnitCriteria = unitCriteriaIds.Count == 0;
            if (missingCommonCriteria || missingUnitCriteria)
            {
                return CreateCurrentMonthIfMissingResult.MissingCriteria(
                    missingCommonCriteria,
                    missingUnitCriteria);
            }

            cancellationToken.ThrowIfCancellationRequested();

            var evaluationBatch = new KPI_DotTheoDoiDanhGia
            {
                TenDotTheoDoiDanhGia = $"Đợt đánh giá tháng {month} năm {year}",
                Thang = month,
                Quy = ((month - 1) / 3) + 1,
                Nam = year,
                ThoiGianBatDau = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Unspecified),
                ThoiGianKetThuc = new DateTime(
                    year,
                    month,
                    DateTime.DaysInMonth(year, month),
                    0,
                    0,
                    0,
                    DateTimeKind.Unspecified),
                TrangThai = TrangThaiDotDanhGiaConstant.ACTIVE,
                DefaultTieuChiChung = commonCriteriaIds[Random.Shared.Next(commonCriteriaIds.Count)],
                DefaultTieuChiDonVi = unitCriteriaIds[Random.Shared.Next(unitCriteriaIds.Count)],
                Type = LoaiDotDanhGiaConstant.CA_NHAN
            };

            await CreateAsync(evaluationBatch);
            return CreateCurrentMonthIfMissingResult.Created(evaluationBatch);
        }

        public async Task<KPI_DotTheoDoiDanhGia> CloneAsync(KPI_DotTheoDoiDanhGiaCloneRequest model)
        {
            var newEntity = _mapper.Map<KPI_DotTheoDoiDanhGiaRequest, KPI_DotTheoDoiDanhGia>(model);
            await CreateAsync(newEntity);

            if (model.SourceId != Guid.Empty)
            {
                // 1. Clone KPI_BoTieuChiChung của đợt cũ sang đợt mới (nếu có)
                var sourceBoTieuChiChungs = await _boTieuChiChungRepository.GetQueryable()
                    .Where(x => !x.IsDeleted && x.IdDot == model.SourceId)
                    .ToListAsync();

                var oldToNewBoTieuChiChungMap = new Dictionary<Guid, Guid>();

                foreach (var btc in sourceBoTieuChiChungs)
                {
                    var newBtcId = Guid.NewGuid();
                    oldToNewBoTieuChiChungMap[btc.Id] = newBtcId;

                    var newBtc = new KPI_BoTieuChiChung
                    {
                        Id = newBtcId,
                        SoQuyetDinh = btc.SoQuyetDinh,
                        TenBoTieuChiDonVi = btc.TenBoTieuChiDonVi,
                        IdDonVi = btc.IdDonVi,
                        IdDot = newEntity.Id,
                        NgayQuyetDinh = btc.NgayQuyetDinh,
                        ApDungTuNgay = btc.ApDungTuNgay,
                        ApDungToiNgay = btc.ApDungToiNgay,
                        IsActive = true,
                    };

                    _boTieuChiChungRepository.Add(newBtc);
                }

                if (sourceBoTieuChiChungs.Any())
                {
                    await _boTieuChiChungRepository.SaveAsync();

                    // Sau khi đã lưu bộ mới, mới tắt các bộ cũ (dùng tracking để Update hoạt động)
                    foreach (var btc in sourceBoTieuChiChungs)
                    {
                        if (btc.IdDonVi.HasValue)
                        {
                            var newBtcId = oldToNewBoTieuChiChungMap[btc.Id];
                            var oldDepartmentBtcs = await _boTieuChiChungRepository.GetQueryableWithTracking()
                                .Where(x => x.Id != newBtcId && x.IdDonVi == btc.IdDonVi.Value && x.Type == btc.Type)
                                .ToListAsync();

                            foreach (var oldBtc in oldDepartmentBtcs)
                            {
                                oldBtc.IsActive = false;
                                _boTieuChiChungRepository.Update(oldBtc);
                            }
                        }
                    }
                    await _boTieuChiChungRepository.SaveAsync();
                }

                // 2. Clone KPI_BoTieuChiDonVi của đợt cũ sang đợt mới (nếu có)
                var sourceBoTieuChiDonVis = await _boTieuChiDonViRepository.GetQueryable()
                    .Where(x => !x.IsDeleted && x.IdDot == model.SourceId)
                    .ToListAsync();

                var oldToNewBoTieuChiDonViMap = new Dictionary<Guid, Guid>();

                foreach (var btc in sourceBoTieuChiDonVis)
                {
                    var newBtcId = Guid.NewGuid();
                    oldToNewBoTieuChiDonViMap[btc.Id] = newBtcId;

                    var newBtc = new KPI_BoTieuChiDonVi
                    {
                        Id = newBtcId,
                        SoQuyetDinh = btc.SoQuyetDinh,
                        TenBoTieuChiDonVi = btc.TenBoTieuChiDonVi,
                        IdDonVi = btc.IdDonVi,
                        IdDot = newEntity.Id,
                        NgayQuyetDinh = btc.NgayQuyetDinh,
                        ApDungTuNgay = btc.ApDungTuNgay,
                        ApDungToiNgay = btc.ApDungToiNgay,
                        Is_locked = false,
                    };

                    _boTieuChiDonViRepository.Add(newBtc);
                }

                if (sourceBoTieuChiDonVis.Any())
                {
                    await _boTieuChiDonViRepository.SaveAsync();

                    foreach (var btc in sourceBoTieuChiDonVis)
                    {
                        if (btc.IdDonVi.HasValue)
                        {
                            var newBtcId = oldToNewBoTieuChiDonViMap[btc.Id];
                            var oldDepartmentBtcs = await _boTieuChiDonViRepository.GetQueryableWithTracking()
                                .Where(x => x.Id != newBtcId && x.IdDonVi == btc.IdDonVi.Value)
                                .ToListAsync();

                            foreach (var oldBtc in oldDepartmentBtcs)
                            {
                                oldBtc.Is_locked = true;
                                _boTieuChiDonViRepository.Update(oldBtc);
                            }
                        }
                    }
                    await _boTieuChiDonViRepository.SaveAsync();
                }

                // 3. Clone cấu hình đơn vị theo đợt
                var sourceConfigs = await _dotDanhGiaDonViRepository.GetQueryable()
                    .Where(x => x.IdDotDanhGia == model.SourceId)
                    .ToListAsync();

                if (sourceConfigs != null && sourceConfigs.Any())
                {
                    var newConfigs = sourceConfigs.Select(cfg => new KPI_DotDanhGia_DonVi
                    {
                        IdDotDanhGia = newEntity.Id,
                        IdDonVi = cfg.IdDonVi,
                        IdBoChiSoNhiemVu = cfg.IdBoChiSoNhiemVu.HasValue && oldToNewBoTieuChiDonViMap.ContainsKey(cfg.IdBoChiSoNhiemVu.Value)
                            ? oldToNewBoTieuChiDonViMap[cfg.IdBoChiSoNhiemVu.Value]
                            : cfg.IdBoChiSoNhiemVu,
                        IdBoTieuChiChung = cfg.IdBoTieuChiChung.HasValue && oldToNewBoTieuChiChungMap.ContainsKey(cfg.IdBoTieuChiChung.Value)
                            ? oldToNewBoTieuChiChungMap[cfg.IdBoTieuChiChung.Value]
                            : cfg.IdBoTieuChiChung
                    }).ToList();

                    _dotDanhGiaDonViRepository.AddRange(newConfigs);
                    await _dotDanhGiaDonViRepository.SaveAsync();
                }
            }

            return newEntity;
        }

    }
}
