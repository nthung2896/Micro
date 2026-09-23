using Hinet.Model.Entities;
using Hinet.Repository.KPI_PhieuDanhGiaRepository;
using Hinet.Repository.KPI_QuaTrinhXuLyPhieuDanhGiaRepository;
using Hinet.Repository.KPI_TieuChiChung_DiemSo_CapTrenRepository;
using Hinet.Repository.KPI_TieuChiChung_DiemSoRepository;
using Hinet.Repository.KPI_TieuChiChungRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_PhieuDanhGiaService.Constant;
using Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService.Dto;
using Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService.ViewModels;
using Hinet.Service.KPI_TieuChiChungService;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Service.KPI_TieuChiChung_DiemSo_CapTrenService
{
    public class KPI_TieuChiChung_DiemSo_CapTrenService : Service<KPI_TieuChiChung_DiemSo_CapTren>, IKPI_TieuChiChung_DiemSo_CapTrenService
    {
        private const string PhoTruongPhong = "PhoTruongPhong";
        private const string GuiPhoTruongPhong = "GuiPhoTruongPhong";
        private const string GuiTruongPhong = "GuiTruongPhong";
        private const string GuiPhoCucTruong = "GuiPhoCucTruong";
        private const string GuiCucTruong = "GuiCucTruong";
        private readonly IKPI_TieuChiChung_DiemSo_CapTrenRepository _capTrenRepository;
        private readonly IKPI_TieuChiChung_DiemSoRepository _diemSoRepository;
        private readonly IKPI_PhieuDanhGiaRepository _phieuDanhGiaRepository;
        private readonly IKPI_TieuChiChungRepository _tieuChiChungRepository;
        private readonly IKPI_TieuChiChungService _tieuChiChungService;
        private readonly IKPI_QuaTrinhXuLyPhieuDanhGiaRepository _quaTrinhRepository;

        public KPI_TieuChiChung_DiemSo_CapTrenService(
            IKPI_TieuChiChung_DiemSo_CapTrenRepository capTrenRepository,
            IKPI_TieuChiChung_DiemSoRepository diemSoRepository,
            IKPI_PhieuDanhGiaRepository phieuDanhGiaRepository,
            IKPI_TieuChiChungRepository tieuChiChungRepository,
            IKPI_TieuChiChungService tieuChiChungService,
            IKPI_QuaTrinhXuLyPhieuDanhGiaRepository quaTrinhRepository) : base(capTrenRepository)
        {
            _capTrenRepository = capTrenRepository;
            _diemSoRepository = diemSoRepository;
            _phieuDanhGiaRepository = phieuDanhGiaRepository;
            _tieuChiChungRepository = tieuChiChungRepository;
            _tieuChiChungService = tieuChiChungService;
            _quaTrinhRepository = quaTrinhRepository;
        }

        public async Task<PagedList<KPI_TieuChiChung_DiemSo_CapTrenDto>> GetData(KPI_TieuChiChung_DiemSo_CapTrenSearch search)
        {
            var query = from q in GetQueryable()
                        select new KPI_TieuChiChung_DiemSo_CapTrenDto
                        {
                            Id_TieuChiChung_DiemSo = q.Id_TieuChiChung_DiemSo,
                            Id_PhieuDanhGia = q.Id_PhieuDanhGia,
                            Id_LyLich = q.Id_LyLich,
                            Id_DotDanhGia = q.Id_DotDanhGia,
                            VaiTroDanhGia = q.VaiTroDanhGia,
                            Diem = q.Diem,
                            GhiChu = q.GhiChu,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                        };

            if (search != null)
            {
                if (!string.IsNullOrWhiteSpace(search.Id_TieuChiChung_DiemSo) &&
                    Guid.TryParse(search.Id_TieuChiChung_DiemSo, out var idDiemSo))
                {
                    query = query.Where(x => x.Id_TieuChiChung_DiemSo == idDiemSo);
                }

                if (!string.IsNullOrWhiteSpace(search.VaiTroDanhGia))
                {
                    query = query.Where(x => EF.Functions.Like(x.VaiTroDanhGia, $"%{search.VaiTroDanhGia}%"));
                }

                if (search.Diem.HasValue)
                {
                    query = query.Where(x => x.Diem == search.Diem);
                }

                if (!string.IsNullOrWhiteSpace(search.GhiChu))
                {
                    query = query.Where(x => EF.Functions.Like(x.GhiChu, $"%{search.GhiChu}%"));
                }
            }

            query = query.OrderByDescending(x => x.CreatedDate);
            return await PagedList<KPI_TieuChiChung_DiemSo_CapTrenDto>.CreateAsync(query, search);
        }

        public async Task<KPI_TieuChiChung_DiemSo_CapTrenDto?> GetDto(Guid id)
        {
            return await (from q in GetQueryable().Where(x => x.Id == id)
                          select new KPI_TieuChiChung_DiemSo_CapTrenDto
                          {
                              Id_TieuChiChung_DiemSo = q.Id_TieuChiChung_DiemSo,
                              Id_PhieuDanhGia = q.Id_PhieuDanhGia,
                              Id_LyLich = q.Id_LyLich,
                              Id_DotDanhGia = q.Id_DotDanhGia,
                              VaiTroDanhGia = q.VaiTroDanhGia,
                              Diem = q.Diem,
                              GhiChu = q.GhiChu,
                              CreatedBy = q.CreatedBy,
                              UpdatedBy = q.UpdatedBy,
                              IsDeleted = q.IsDeleted,
                              DeletedId = q.DeletedId,
                              CreatedDate = q.CreatedDate,
                              UpdatedDate = q.UpdatedDate,
                              Id = q.Id,
                          }).FirstOrDefaultAsync();
        }

        public async Task<bool> CanEditRecord(Guid id, Guid? currentUserId)
        {
            var record = await _capTrenRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == id);
            if (record == null)
            {
                return false;
            }

            return await CanEditPersonalScore(record.Id_TieuChiChung_DiemSo, currentUserId);
        }

        public async Task<bool> CanEditPersonalScore(Guid idTieuChiChungDiemSo, Guid? currentUserId)
        {
            var phieuId = await _diemSoRepository.GetQueryable()
                .Where(x => x.Id == idTieuChiChungDiemSo)
                .Select(x => x.IdPhieuDanhGia)
                .FirstOrDefaultAsync();
            if (!phieuId.HasValue)
            {
                return false;
            }

            var phieu = await _phieuDanhGiaRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == phieuId.Value);
            return phieu != null && await CanEditAsync(phieu, currentUserId);
        }

        public async Task<KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse> GetByPhieu(Guid idPhieuDanhGia, Guid? currentUserId)
        {
            var phieu = await _phieuDanhGiaRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idPhieuDanhGia);
            if (phieu == null)
            {
                throw new InvalidOperationException("Phiếu đánh giá không tồn tại.");
            }

            var canEdit = await CanEditAsync(phieu, currentUserId);
            var vaiTroDanhGia = GetEvaluatorRole(phieu.TrangThai);
            if (canEdit)
            {
                // Các phiếu cũ có thể chỉ có dòng điểm cá nhân cho những tiêu chí
                // mà người dùng đã nhập. Khởi tạo các dòng lá còn thiếu với điểm
                // tự chấm 0 để PTP vẫn có đủ khóa chi tiết để đánh giá.
                await EnsurePersonalScoreRowsAsync(phieu);
            }

            // Một phiếu có thể còn các dòng điểm từ bộ tiêu chí cũ khi cấu hình
            // đợt bị thay đổi. Chỉ trả về các tiêu chí lá của bộ đang áp dụng;
            // nếu không, PTP sẽ thấy/lưu cả các dòng lịch sử không hiển thị trên
            // cây tiêu chí hiện tại.
            var appliedLeafCriteria = await GetAppliedLeafCriteriaAsync(phieu);
            var appliedLeafCriterionIds = appliedLeafCriteria.Select(x => x.Id).ToList();
            var personalScores = appliedLeafCriterionIds.Count == 0
                ? new List<KPI_TieuChiChung_DiemSo>()
                : await GetPersonalScoreRowsAsync(phieu)
                    .Where(x => x.IdTieuChiChung.HasValue
                        && appliedLeafCriterionIds.Contains(x.IdTieuChiChung.Value))
                    .OrderBy(x => x.CreatedDate)
                    .ToListAsync();
            var criterionById = appliedLeafCriteria.ToDictionary(x => x.Id);

            var personalScoreIds = personalScores.Select(x => x.Id).ToList();
            var allCapTrenScores = personalScoreIds.Count == 0
                ? new List<KPI_TieuChiChung_DiemSo_CapTren>()
                : await _capTrenRepository.GetQueryable()
                    .Where(x => personalScoreIds.Contains(x.Id_TieuChiChung_DiemSo))
                    .OrderBy(x => x.CreatedDate)
                    .ToListAsync();

            var currentCapTrenScores = allCapTrenScores
                .Where(x => x.VaiTroDanhGia == vaiTroDanhGia)
                .GroupBy(x => x.Id_TieuChiChung_DiemSo)
                .ToDictionary(x => x.Key, x => x.Last());

            var allScoresByItemAndRole = allCapTrenScores
                .GroupBy(x => x.Id_TieuChiChung_DiemSo)
                .ToDictionary(
                    g => g.Key,
                    g => g.GroupBy(x => x.VaiTroDanhGia)
                          .ToDictionary(rg => rg.Key, rg => rg.Last().Diem)
                );

            var danhSachVaiTro = allCapTrenScores
                .Select(x => x.VaiTroDanhGia)
                .Where(x => !string.IsNullOrEmpty(x))
                .Distinct()
                .ToList();

            var tongDiemTheoVaiTro = new Dictionary<string, decimal>();
            foreach (var r in danhSachVaiTro)
            {
                tongDiemTheoVaiTro[r] = allCapTrenScores
                    .Where(x => x.VaiTroDanhGia == r && x.Diem.HasValue)
                    .GroupBy(x => x.Id_TieuChiChung_DiemSo)
                    .Sum(x => x.Last().Diem!.Value);
            }

            var items = personalScores
                .Where(x => x.IdTieuChiChung.HasValue)
                .Select(x =>
                {
                    var roleMap = allScoresByItemAndRole.TryGetValue(x.Id, out var rm) ? rm : new Dictionary<string, decimal?>();
                    return new KPI_TieuChiChung_DiemSo_CapTrenByPhieuDto
                    {
                        IdTieuChiChungDiemSo = x.Id,
                        IdTieuChiChung = x.IdTieuChiChung!.Value,
                        IdPhieuDanhGia = x.IdPhieuDanhGia,
                        IdLyLich = x.IdLyLich,
                        IdDotDanhGia = x.IdDotDanhGia,
                        DiemTuCham = x.DiemTuCham,
                        DiemCapTren = currentCapTrenScores.TryGetValue(x.Id, out var capTren) ? capTren.Diem : null,
                        DiemToiDa = criterionById.TryGetValue(x.IdTieuChiChung.Value, out var criterion) ? criterion.MyProperty : null,
                        GhiChu = currentCapTrenScores.TryGetValue(x.Id, out capTren) ? capTren.GhiChu : null,
                        DiemTheoVaiTro = roleMap
                    };
                })
                .ToList();

            var currentCapTrenScoresForCompletion = currentCapTrenScores
                .ToDictionary(x => x.Key, x => x.Value.Diem);
            var completion = await GetCompletionStateAsync(phieu, personalScores, currentCapTrenScoresForCompletion);

            return new KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse
            {
                Items = items,
                VaiTroDanhGia = vaiTroDanhGia,
                CanEdit = canEdit,
                TongDiemCapTren = items.Sum(x => x.DiemCapTren ?? 0m),
                IsComplete = completion.IsComplete,
                DanhSachVaiTroDaDanhGia = danhSachVaiTro,
                TongDiemTheoVaiTro = tongDiemTheoVaiTro,
            };
        }

        public async Task SaveBatch(KPI_TieuChiChung_DiemSo_CapTrenSaveBatchVM request, Guid? currentUserId)
        {
            if (request == null || request.IdPhieuDanhGia == Guid.Empty)
            {
                throw new InvalidOperationException("Thông tin phiếu đánh giá không hợp lệ.");
            }

            var phieu = await _phieuDanhGiaRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == request.IdPhieuDanhGia);
            if (phieu == null)
            {
                throw new InvalidOperationException("Phiếu đánh giá không tồn tại.");
            }

            if (!await CanEditAsync(phieu, currentUserId))
            {
                throw new UnauthorizedAccessException("Bạn không phải cấp đang được giao xử lý phiếu này.");
            }

            // tạo vai trò đánh giá dựa trên trạng thái phiếu
            var vaiTroDanhGia = GetEvaluatorRole(phieu.TrangThai);

            await EnsurePersonalScoreRowsAsync(phieu);

            // Không cho phép lưu điểm cấp trên cho dòng của bộ tiêu chí cũ hoặc
            // cho tiêu chí cha. Các dòng lịch sử vẫn được giữ nguyên trong DB.
            var appliedLeafCriteria = await GetAppliedLeafCriteriaAsync(phieu);
            var appliedLeafCriterionIds = appliedLeafCriteria.Select(x => x.Id).ToList();
            if (appliedLeafCriterionIds.Count == 0)
            {
                throw new InvalidOperationException("Không xác định được các tiêu chí lá của bộ tiêu chí đang áp dụng cho phiếu.");
            }

            var items = request.Items ?? new List<KPI_TieuChiChung_DiemSo_CapTrenSaveBatchItemVM>();
            var duplicateId = items
                .GroupBy(x => x.IdTieuChiChungDiemSo)
                .FirstOrDefault(x => x.Key == Guid.Empty || x.Count() > 1);
            if (duplicateId != null)
            {
                throw new InvalidOperationException("Danh sách điểm PTP có dòng trùng hoặc ID không hợp lệ.");
            }

            var personalScores = await GetPersonalScoreRowsAsync(phieu)
                .Where(x => x.IdTieuChiChung.HasValue
                    && appliedLeafCriterionIds.Contains(x.IdTieuChiChung.Value))
                .ToListAsync();
            var personalById = personalScores.ToDictionary(x => x.Id);
            var criterionById = appliedLeafCriteria.ToDictionary(x => x.Id);

            foreach (var item in items)
            {
                if (!personalById.TryGetValue(item.IdTieuChiChungDiemSo, out var personalScore))
                {
                    throw new InvalidOperationException("Có dòng điểm cá nhân không thuộc phiếu đánh giá này.");
                }

                if (!personalScore.IdPhieuDanhGia.HasValue
                    || !personalScore.IdLyLich.HasValue
                    || !personalScore.IdDotDanhGia.HasValue)
                {
                    throw new InvalidOperationException("Dòng điểm cá nhân không đầy đủ thông tin phiếu, lý lịch hoặc đợt đánh giá.");
                }

                if (item.Diem.HasValue)
                {
                    if (item.Diem.Value < 0)
                    {
                        throw new InvalidOperationException("Điểm PTP không được nhỏ hơn 0.");
                    }

                    if (personalScore.IdTieuChiChung.HasValue &&
                        criterionById.TryGetValue(personalScore.IdTieuChiChung.Value, out var criterion) &&
                        criterion.MyProperty.HasValue && item.Diem.Value > criterion.MyProperty.Value)
                    {
                        throw new InvalidOperationException($"Điểm PTP vượt điểm tối đa của tiêu chí {criterion.Ten ?? personalScore.IdTieuChiChung.Value.ToString()}.");
                    }
                }
            }

            var existing = await _capTrenRepository.GetQueryable()
                .Where(x => x.VaiTroDanhGia == vaiTroDanhGia && personalById.Keys.Contains(x.Id_TieuChiChung_DiemSo))
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
            var existingByPersonalScore = existing
                .GroupBy(x => x.Id_TieuChiChung_DiemSo)
                .ToDictionary(x => x.Key, x => x.First());

            var projectedCapTrenScores = existingByPersonalScore
                .ToDictionary(x => x.Key, x => x.Value.Diem);
            foreach (var item in items)
            {
                projectedCapTrenScores[item.IdTieuChiChungDiemSo] = item.Diem;
            }

            if (request.IsHoanTat)
            {
                var completion = await GetCompletionStateAsync(phieu, personalScores, projectedCapTrenScores);
                if (!completion.IsComplete)
                {
                    throw new InvalidOperationException(string.Join(" ", completion.Errors));
                }
            }

            var newEntities = new List<KPI_TieuChiChung_DiemSo_CapTren>();
            var updatedEntities = new List<KPI_TieuChiChung_DiemSo_CapTren>();
            foreach (var item in items)
            {
                if (!personalById.TryGetValue(item.IdTieuChiChungDiemSo, out var personalScore))
                {
                    throw new InvalidOperationException("Có dòng điểm cá nhân không thuộc phiếu đánh giá này.");
                }

                if (existingByPersonalScore.TryGetValue(item.IdTieuChiChungDiemSo, out var entity))
                {
                    entity.Id_PhieuDanhGia = personalScore.IdPhieuDanhGia;
                    entity.Id_LyLich = personalScore.IdLyLich;
                    entity.Id_DotDanhGia = personalScore.IdDotDanhGia;
                    entity.Diem = item.Diem;
                    entity.GhiChu = item.GhiChu;
                    entity.VaiTroDanhGia = vaiTroDanhGia;
                    updatedEntities.Add(entity);
                }
                else if (item.Diem.HasValue)
                {
                    newEntities.Add(new KPI_TieuChiChung_DiemSo_CapTren
                    {
                        Id_TieuChiChung_DiemSo = item.IdTieuChiChungDiemSo,
                        Id_PhieuDanhGia = personalScore.IdPhieuDanhGia,
                        Id_LyLich = personalScore.IdLyLich,
                        Id_DotDanhGia = personalScore.IdDotDanhGia,
                        VaiTroDanhGia = vaiTroDanhGia,
                        Diem = item.Diem,
                        GhiChu = item.GhiChu,
                    });
                }
            }

            if (updatedEntities.Count > 0)
            {
                await UpdateAsync(updatedEntities);
            }
            if (newEntities.Count > 0)
            {
                await CreateRange(newEntities);
            }
        }

        private async Task<bool> CanEditAsync(KPI_PhieuDanhGia phieu, Guid? currentUserId)
        {
            if (!currentUserId.HasValue || currentUserId.Value == Guid.Empty || string.IsNullOrEmpty(GetEvaluatorRole(phieu.TrangThai)))
            {
                return false;
            }

            return await _quaTrinhRepository.GetQueryable()
                .AnyAsync(x => x.IdPhieuDanhGia == phieu.Id
                    && x.IdNguoiXuLy == currentUserId.Value
                    && x.TrangThai == phieu.TrangThai
                    && x.IsXuLy == false);
        }

        private static string GetEvaluatorRole(string? trangThai)
        {
            return trangThai switch
            {
                GuiPhoTruongPhong => PhoTruongPhong,
                GuiTruongPhong => "TruongPhong",
                GuiPhoCucTruong => "PhoCucTruong",
                GuiCucTruong => "CucTruong",
                TrangThaiPhieuV1Constant.GuiPhoGiamDocTT => TrangThaiPhieuV1Constant.GuiPhoGiamDocTT,
                TrangThaiPhieuV1Constant.GuiGiamDocTT => TrangThaiPhieuV1Constant.GuiGiamDocTT,
                TrangThaiPhieuV1Constant.GuiPhoVuTruong => TrangThaiPhieuV1Constant.GuiPhoVuTruong,
                TrangThaiPhieuV1Constant.GuiPhoChanhVanPhong => TrangThaiPhieuV1Constant.GuiPhoChanhVanPhong,
                TrangThaiPhieuV1Constant.GuiChanhVanPhong => TrangThaiPhieuV1Constant.GuiChanhVanPhong,
                TrangThaiPhieuV1Constant.GuiVuTruong => TrangThaiPhieuV1Constant.GuiVuTruong,
                _ => string.Empty,
            };
        }

        private async Task<(bool IsComplete, List<string> Errors)> GetCompletionStateAsync(
            KPI_PhieuDanhGia phieu,
            List<KPI_TieuChiChung_DiemSo> personalScores,
            IDictionary<Guid, decimal?> capTrenScores)
        {
            var criteria = await GetAppliedCriteriaAsync(phieu);
            var errors = new List<string>();
            if (criteria.Count == 0)
            {
                errors.Add("Không xác định được bộ tiêu chí chung áp dụng cho phiếu.");
                return (false, errors);
            }

            var criterionIds = criteria.Select(x => x.Id).ToHashSet();
            var leafCriteria = GetLeafCriteria(criteria);
            var personalByCriterion = personalScores
                .Where(x => x.IdTieuChiChung.HasValue && criterionIds.Contains(x.IdTieuChiChung.Value))
                .GroupBy(x => x.IdTieuChiChung!.Value)
                .ToDictionary(x => x.Key, x => x.ToList());

            foreach (var criterion in leafCriteria)
            {
                if (!personalByCriterion.TryGetValue(criterion.Id, out var personalRows) || personalRows.Count == 0)
                {
                    errors.Add($"Thiếu dòng điểm cá nhân cho tiêu chí {criterion.Ten ?? criterion.Id.ToString()}.");
                    continue;
                }

                foreach (var personalRow in personalRows)
                {
                    if (!capTrenScores.TryGetValue(personalRow.Id, out var capTrenScore) || !capTrenScore.HasValue)
                    {
                        errors.Add($"Thiếu điểm PTP cho tiêu chí {criterion.Ten ?? criterion.Id.ToString()}.");
                    }
                }
            }

            return (errors.Count == 0, errors);
        }

        private async Task EnsurePersonalScoreRowsAsync(KPI_PhieuDanhGia phieu)
        {
            var appliedCriteria = await GetAppliedCriteriaAsync(phieu);
            if (appliedCriteria.Count == 0)
            {
                return;
            }

            var appliedCriterionIds = appliedCriteria
                .Select(x => x.Id)
                .ToHashSet();
            var leafCriteria = GetLeafCriteria(appliedCriteria);
            var existingRows = await GetPersonalScoreRowsAsync(phieu)
                .Where(x => x.IdTieuChiChung.HasValue
                    && appliedCriterionIds.Contains(x.IdTieuChiChung.Value))
                .ToListAsync();

            // Dữ liệu tạo trước đây có thể đã lưu đúng lý lịch/đợt nhưng chưa
            // gắn IdPhieuDanhGia. Gắn lại đúng phiếu để GetByPhieu và SaveBatch
            // luôn lấy được cùng một dòng điểm cá nhân.
            var rowsNeedPhieu = existingRows
                .Where(x => x.IdPhieuDanhGia != phieu.Id)
                .ToList();
            if (rowsNeedPhieu.Count > 0)
            {
                foreach (var row in rowsNeedPhieu)
                {
                    row.IdPhieuDanhGia = phieu.Id;
                    _diemSoRepository.Update(row);
                }

                await _diemSoRepository.SaveAsync();
            }

            var existingCriterionIds = existingRows
                .Select(x => x.IdTieuChiChung!.Value)
                .ToList();
            var existingSet = existingCriterionIds.ToHashSet();

            var missingRows = leafCriteria
                .Where(x => !existingSet.Contains(x.Id))
                .Select(x => new KPI_TieuChiChung_DiemSo
                {
                    IdTieuChiChung = x.Id,
                    IdLyLich = phieu.IdLyLich,
                    IdDotDanhGia = phieu.IdDotDanhGia,
                    IdPhieuDanhGia = phieu.Id,
                    // Tạo sẵn dòng điểm cá nhân cho tiêu chí chưa được nhập.
                    // Điểm 0 vẫn là một giá trị hợp lệ và giúp cấp trên có
                    // Id_TieuChiChung_DiemSo để lưu điểm PTP theo batch.
                    DiemTuCham = 0,
                })
                .ToList();

            if (missingRows.Count > 0)
            {
                _diemSoRepository.AddRange(missingRows);
                await _diemSoRepository.SaveAsync();
            }
        }

        private async Task<List<KPI_TieuChiChung>> GetAppliedLeafCriteriaAsync(KPI_PhieuDanhGia phieu)
        {
            var appliedCriteria = await GetAppliedCriteriaAsync(phieu);
            return GetLeafCriteria(appliedCriteria);
        }

        private static List<KPI_TieuChiChung> GetLeafCriteria(List<KPI_TieuChiChung> criteria)
        {
            return criteria
                .Where(x => !criteria.Any(child => child.ParentId.HasValue && child.ParentId.Value == x.Id))
                .ToList();
        }

        private IQueryable<KPI_TieuChiChung_DiemSo> GetPersonalScoreRowsAsync(KPI_PhieuDanhGia phieu)
        {
            var query = _diemSoRepository.GetQueryable();
            if (!phieu.IdLyLich.HasValue || !phieu.IdDotDanhGia.HasValue)
            {
                return query.Where(x => x.IdPhieuDanhGia == phieu.Id);
            }

            var idLyLich = phieu.IdLyLich.Value;
            var idDotDanhGia = phieu.IdDotDanhGia.Value;
            return query.Where(x => x.IdPhieuDanhGia == phieu.Id
                || ((!x.IdPhieuDanhGia.HasValue || x.IdPhieuDanhGia == Guid.Empty)
                    && x.IdLyLich == idLyLich
                    && x.IdDotDanhGia == idDotDanhGia));
        }

        private async Task<List<KPI_TieuChiChung>> GetAppliedCriteriaAsync(KPI_PhieuDanhGia phieu)
        {
            if (!phieu.IdDotDanhGia.HasValue || phieu.IdDotDanhGia.Value == Guid.Empty)
            {
                return new List<KPI_TieuChiChung>();
            }

            // Dùng cùng resolver với GetTreeDataForDot để màn hình và luồng
            // cấp trên luôn chọn cùng một bộ tiêu chí cho phiếu.
            var boTieuChiChung = await _tieuChiChungService.GetBoTieuChiChungApDungForDot(
                phieu.IdDotDanhGia.Value,
                phieu.IdLyLich,
                phieu.Id);
            if (boTieuChiChung == null || boTieuChiChung.IdBoTieuChiChung == Guid.Empty)
            {
                return new List<KPI_TieuChiChung>();
            }

            return await _tieuChiChungRepository.GetQueryable()
                .Where(x => x.IdBoTieuChiChung == boTieuChiChung.IdBoTieuChiChung)
                .OrderBy(x => x.Priority ?? int.MaxValue)
                .ThenBy(x => x.CreatedDate)
                .ToListAsync();
        }
    }
}
