using System.Data;
using Hinet.Model;
using Hinet.Model.Entities;
using Hinet.Repository.KPI_KetQuaThucHienNhiemVuRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.DM_DuLieuDanhMucService;
using Hinet.Service.KPI_KetQuaThucHienNhiemVuService.Dto;
using Hinet.Service.KPI_NhiemVuService.Dto;
using Microsoft.EntityFrameworkCore;

namespace Hinet.Service.KPI_KetQuaThucHienNhiemVuService
{
    public class KPI_KetQuaThucHienNhiemVuService : Service<KPI_KetQuaThucHienNhiemVu>, IKPI_KetQuaThucHienNhiemVuService
    {
        private const double ScoreTolerance = 0.01d;

        private readonly HinetContext _context;
        private readonly IDM_DuLieuDanhMucService _dmDuLieuDanhMucService;

        public KPI_KetQuaThucHienNhiemVuService(
            IKPI_KetQuaThucHienNhiemVuRepository repository,
            HinetContext context,
            IDM_DuLieuDanhMucService dmDuLieuDanhMucService
        ) : base(repository)
        {
            _context = context;
            _dmDuLieuDanhMucService = dmDuLieuDanhMucService;
        }

        public async Task SaveKetQuaThucHien(SaveKetQuaThucHienNhiemVuDto model)
        {
            if (!model.IdPhieuDanhGia.HasValue || model.IdPhieuDanhGia.Value == Guid.Empty)
            {
                throw new ArgumentException("Không tìm thấy phiếu đánh giá.");
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
                try
                {
                    var phieu = await _context.KPI_PhieuDanhGia
                        .FirstOrDefaultAsync(x => x.Id == model.IdPhieuDanhGia.Value && !x.IsDeleted)
                        ?? throw new KeyNotFoundException("Không tìm thấy phiếu đánh giá.");

                    var result = await _context.KPI_KetQuaThucHienNhiemVu
                        .FirstOrDefaultAsync(x => x.IdPhieuDanhGia == phieu.Id && !x.IsDeleted);
                    var heSoContext = await ResolveHeSoContextAsync(
                        phieu,
                        model.IdDotDanhGia,
                        result?.DaChotHeSoLanhDao != true
                    );

                    if (result == null)
                    {
                        result = new KPI_KetQuaThucHienNhiemVu
                        {
                            IdPhieuDanhGia = phieu.Id,
                            IdLyLich = heSoContext.Profile.Id,
                            IdDotDanhGia = heSoContext.IdDotDanhGia,
                        };
                        _context.KPI_KetQuaThucHienNhiemVu.Add(result);
                    }
                    else
                    {
                        // Các khóa liên kết luôn lấy từ phiếu, không lấy từ người đang thao tác.
                        result.IdPhieuDanhGia = phieu.Id;
                        result.IdLyLich = heSoContext.Profile.Id;
                        result.IdDotDanhGia = heSoContext.IdDotDanhGia;
                    }

                    if (!result.DaChotHeSoLanhDao)
                    {
                        result.DaChotHeSoLanhDao = true;
                        result.CoApDungHeSoLanhDao = heSoContext.HasConfig;
                        result.HeSoLanhDaoApDung = heSoContext.HasConfig ? heSoContext.Config!.HeSo : null;
                        result.ChucVuLanhDaoApDung = heSoContext.Profile.ChucVuHienTai;
                    }

                    var rows = await GetScoreRowsAsync(heSoContext.Profile.Id, heSoContext.IdDotDanhGia);
                    var summary = CalculateSummary(
                        rows,
                        result.CoApDungHeSoLanhDao,
                        result.HeSoLanhDaoApDung,
                        model
                    );

                    ValidateScore("DiemBoTieuChi", model.DiemBoTieuChi, summary.DiemBoTieuChi);
                    ValidateScore(
                        "DiemHeSoLanhDao",
                        result.CoApDungHeSoLanhDao ? model.DiemHeSoLanhDao : null,
                        result.CoApDungHeSoLanhDao ? summary.DiemHeSoLanhDao : null
                    );
                    ValidateScore("KhoiLuongDiem", model.KhoiLuongDiem, summary.KhoiLuongDiem);
                    ValidateScore("KhoiLuongPhanTram", model.KhoiLuongPhanTram, summary.KhoiLuongPhanTram);
                    ValidateScore("ChatLuongDiem", model.ChatLuongDiem, summary.ChatLuongDiem);
                    ValidateScore("ChatLuongPhanTram", model.ChatLuongPhanTram, summary.ChatLuongPhanTram);
                    ValidateScore("TienDoDiem", model.TienDoDiem, summary.TienDoDiem);
                    ValidateScore("TienDoPhanTram", model.TienDoPhanTram, summary.TienDoPhanTram);
                    ValidateScore("DiemTieuChiKetQua", model.DiemTieuChiKetQua, summary.DiemTieuChiKetQua);

                    result.DiemBoTieuChi = summary.DiemBoTieuChi;
                    result.DiemHeSoLanhDao = result.CoApDungHeSoLanhDao ? summary.DiemHeSoLanhDao : null;
                    result.KhoiLuongDiem = summary.KhoiLuongDiem;
                    result.KhoiLuongPhanTram = summary.KhoiLuongPhanTram;
                    result.ChatLuongDiem = summary.ChatLuongDiem;
                    result.ChatLuongPhanTram = summary.ChatLuongPhanTram;
                    result.TienDoDiem = summary.TienDoDiem;
                    result.TienDoPhanTram = summary.TienDoPhanTram;
                    result.KetQuaLinhVucPhanTram = result.CoApDungHeSoLanhDao ? model.KetQuaLinhVucPhanTram : null;
                    result.KhaNangToChucPhanTram = result.CoApDungHeSoLanhDao ? model.KhaNangToChucPhanTram : null;
                    result.NangLucTapHopPhanTram = result.CoApDungHeSoLanhDao ? model.NangLucTapHopPhanTram : null;
                    result.GhiChuGiaiTrinh = model.GhiChuGiaiTrinh;
                    result.DiemTieuChiKetQua = summary.DiemTieuChiKetQua;

                    phieu.DiemThucHienNhiemVu = ((decimal?)summary.DiemTieuChiKetQua * 70) / 100;
                    phieu.TongDiem = phieu.DiemTieuChiChung + phieu.DiemThucHienNhiemVu;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task<HeSoLanhDaoApDungDto> GetHeSoLanhDaoApDung(Guid? idPhieuDanhGia, Guid? idDotDanhGia, Guid? idLyLich)
        {
            KPI_PhieuDanhGia? phieu = null;
            if (idPhieuDanhGia.HasValue && idPhieuDanhGia.Value != Guid.Empty)
            {
                phieu = await _context.KPI_PhieuDanhGia
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == idPhieuDanhGia.Value && !x.IsDeleted)
                    ?? throw new KeyNotFoundException("Không tìm thấy phiếu đánh giá.");

                var snapshot = await _context.KPI_KetQuaThucHienNhiemVu
                    .AsNoTracking()
                    .Where(x => x.IdPhieuDanhGia == phieu.Id && !x.IsDeleted)
                    .OrderByDescending(x => x.CreatedDate)
                    .FirstOrDefaultAsync();

                if (snapshot?.DaChotHeSoLanhDao == true)
                {
                    return new HeSoLanhDaoApDungDto
                    {
                        DaChotHeSo = true,
                        CoApDungHeSo = snapshot.CoApDungHeSoLanhDao,
                        HeSo = snapshot.HeSoLanhDaoApDung,
                        ChucVuCode = snapshot.ChucVuLanhDaoApDung,
                        TenChucVu = await GetTenChucVuAsync(snapshot.ChucVuLanhDaoApDung),
                        NguonDuLieu = "snapshot",
                    };
                }
            }

            var heSoContext = phieu != null
                ? await ResolveHeSoContextAsync(phieu, idDotDanhGia)
                : await ResolveHeSoContextAsync(idLyLich, idDotDanhGia);

            return new HeSoLanhDaoApDungDto
            {
                DaChotHeSo = false,
                CoApDungHeSo = heSoContext.HasConfig,
                HeSo = heSoContext.HasConfig ? heSoContext.Config!.HeSo : null,
                ChucVuCode = heSoContext.Profile.ChucVuHienTai,
                TenChucVu = await GetTenChucVuAsync(heSoContext.Profile.ChucVuHienTai),
                NguonDuLieu = "cauHinhHienTai",
            };
        }

        public async Task<KPI_KetQuaThucHienNhiemVu?> GetKetQuaThucHien(Guid? idPhieuDanhGia, Guid? idDotDanhGia, Guid? idLyLich)
        {
            var query = GetQueryable();
            if (idPhieuDanhGia.HasValue)
            {
                query = query.Where(x => x.IdPhieuDanhGia == idPhieuDanhGia.Value);
            }
            else if (idDotDanhGia.HasValue && idLyLich.HasValue)
            {
                query = query.Where(x => x.IdDotDanhGia == idDotDanhGia.Value && x.IdLyLich == idLyLich.Value);
            }
            else
            {
                return null;
            }

            return await query.OrderByDescending(x => x.CreatedDate).FirstOrDefaultAsync();
        }

        private async Task<HeSoContext> ResolveHeSoContextAsync(
            KPI_PhieuDanhGia phieu,
            Guid? requestedDotDanhGia,
            bool includeCurrentConfig = true
        )
        {
            if (!phieu.IdLyLich.HasValue || phieu.IdLyLich.Value == Guid.Empty)
            {
                throw new KeyNotFoundException("Phiếu đánh giá chưa có hồ sơ KPI_LyLich2C.");
            }

            if (requestedDotDanhGia.HasValue && phieu.IdDotDanhGia.HasValue && requestedDotDanhGia != phieu.IdDotDanhGia)
            {
                throw new ArgumentException("Đợt đánh giá không thuộc phiếu đánh giá.");
            }

            var idDotDanhGia = phieu.IdDotDanhGia ?? requestedDotDanhGia;
            return await ResolveHeSoContextAsync(phieu.IdLyLich, idDotDanhGia, includeCurrentConfig);
        }

        private async Task<HeSoContext> ResolveHeSoContextAsync(
            Guid? idLyLich,
            Guid? idDotDanhGia,
            bool includeCurrentConfig = true
        )
        {
            if (!idLyLich.HasValue || idLyLich.Value == Guid.Empty)
            {
                throw new KeyNotFoundException("Không tìm thấy hồ sơ KPI_LyLich2C.");
            }

            if (!idDotDanhGia.HasValue || idDotDanhGia.Value == Guid.Empty)
            {
                throw new KeyNotFoundException("Phiếu đánh giá chưa có đợt đánh giá.");
            }

            var profile = await _context.KPI_LyLich2C
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == idLyLich.Value && !x.IsDeleted)
                ?? throw new KeyNotFoundException("Không tìm thấy hồ sơ KPI_LyLich2C của phiếu đánh giá.");

            var idBoTieuChi = await _context.KPI_DotDanhGia_DonVi
                .AsNoTracking()
                .Where(x => !x.IsDeleted
                    && x.IdDotDanhGia == idDotDanhGia.Value
                    && x.IdDonVi == profile.DonViSuDungId)
                .OrderByDescending(x => x.CreatedDate)
                .Select(x => x.IdBoChiSoNhiemVu)
                .FirstOrDefaultAsync();

            var config = includeCurrentConfig
                && idBoTieuChi.HasValue
                && !string.IsNullOrWhiteSpace(profile.ChucVuHienTai)
                ? await _context.KPI_CauHinhDiemTheoHeSoLanhDao
                    .AsNoTracking()
                    .Where(x => !x.IsDeleted
                        && x.IdBoTieuChi == idBoTieuChi.Value
                        && x.ChucVu == profile.ChucVuHienTai)
                    .OrderByDescending(x => x.CreatedDate)
                    .FirstOrDefaultAsync()
                : null;

            return new HeSoContext
            {
                Profile = profile,
                IdDotDanhGia = idDotDanhGia.Value,
                Config = config,
                HasConfig = config?.HeSo.HasValue == true,
            };
        }

        private async Task<string?> GetTenChucVuAsync(string? chucVuCode)
        {
            if (string.IsNullOrWhiteSpace(chucVuCode))
            {
                return null;
            }

            var list = await _dmDuLieuDanhMucService.GetByGroupCode("CHUCVUVNU");
            return list.FirstOrDefault(x => x.Code == chucVuCode)?.Name ?? chucVuCode;
        }

        private async Task<List<ScoreRow>> GetScoreRowsAsync(Guid idLyLich, Guid idDotDanhGia)
        {
            var tasks = await _context.KPI_NhiemVu
                .AsNoTracking()
                .Where(x => !x.IsDeleted
                    && x.IdLyLich == idLyLich
                    && x.IdDotTheoDoiDanhGia == idDotDanhGia)
                .Select(x => new TaskScoreRow
                {
                    Id = x.Id,
                    DiemTheoBoTieuChi = x.DiemTheoBoTieuChi,
                    ChamDiemSoLuong_HoanThanh = x.ChamDiemSoLuong_HoanThanh,
                    ChamDiemSoLuong_KhongHoanThanh = x.ChamDiemSoLuong_KhongHoanThanh,
                    ChamDiemChatLuong_KhongDat = x.ChamDiemChatLuong_KhongDat,
                    ChamDiemTienDo_KhongDat = x.ChamDiemTienDo_KhongDat,
                    ChamDiemChatLuong_SoDiemConLai = x.ChamDiemChatLuong_SoDiemConLai,
                    ChamDiemTienDo_SoDiemConLai = x.ChamDiemTienDo_SoDiemConLai,
                })
                .ToListAsync();

            var taskIds = tasks.Select(x => x.Id).ToList();
            var outputs = taskIds.Count == 0
                ? new List<KPI_DauRaNhiemVu>()
                : await _context.KPI_DauRaNhiemVu
                    .AsNoTracking()
                    .Where(x => !x.IsDeleted && x.IdNhiemVu.HasValue && taskIds.Contains(x.IdNhiemVu.Value))
                    .ToListAsync();

            var rows = new List<ScoreRow>();
            foreach (var task in tasks)
            {
                var taskOutputs = outputs.Where(x => x.IdNhiemVu == task.Id).ToList();
                if (taskOutputs.Count == 0)
                {
                    rows.Add(new ScoreRow
                    {
                        DiemTheoBoTieuChi = task.DiemTheoBoTieuChi,
                        ChamDiemSoLuong_HoanThanh = task.ChamDiemSoLuong_HoanThanh,
                        ChamDiemChatLuong_KhongDat = task.ChamDiemChatLuong_KhongDat,
                        ChamDiemTienDo_KhongDat = task.ChamDiemTienDo_KhongDat,
                    });
                    continue;
                }

                rows.AddRange(taskOutputs.Select(output => new ScoreRow
                {
                    DiemTheoBoTieuChi = output.DiemTheoBoTieuChi ?? task.DiemTheoBoTieuChi,
                    ChamDiemSoLuong_HoanThanh = output.ChamDiemSoLuong_HoanThanh,
                    ChamDiemChatLuong_KhongDat = output.ChamDiemChatLuong_KhongDat,
                    ChamDiemTienDo_KhongDat = output.ChamDiemTienDo_KhongDat,
                }));
            }

            return rows;
        }

        private static ScoreSummary CalculateSummary(
            IEnumerable<ScoreRow> rows,
            bool coApDungHeSo,
            decimal? heSo,
            SaveKetQuaThucHienNhiemVuDto model)
        {
            var summary = new ScoreSummary();
            var coefficient = heSo.HasValue ? (double)heSo.Value : 1d;

            foreach (var row in rows)
            {
                var diemBoTieuChi = row.DiemTheoBoTieuChi ?? 0d;
                var diemCoSo = coApDungHeSo ? diemBoTieuChi * coefficient : diemBoTieuChi;
                var soLuongHoanThanh = row.ChamDiemSoLuong_HoanThanh ?? 0d;
                var chatLuongConLai = Math.Max(0d, diemCoSo - (row.ChamDiemChatLuong_KhongDat ?? 0d) * 0.25d * diemCoSo);
                var tienDoConLai = Math.Max(0d, diemCoSo - (row.ChamDiemTienDo_KhongDat ?? 0d) * 0.25d * diemCoSo);

                summary.DiemBoTieuChi += diemBoTieuChi;
                summary.DiemHeSoLanhDao += diemCoSo;
                summary.KhoiLuongDiem += soLuongHoanThanh;
                summary.ChatLuongDiem += chatLuongConLai;
                summary.TienDoDiem += tienDoConLai;
            }

            var diemCoSoTong = coApDungHeSo ? summary.DiemHeSoLanhDao : summary.DiemBoTieuChi;
            summary.KhoiLuongPhanTram = CalculatePercent(summary.KhoiLuongDiem, diemCoSoTong);
            summary.ChatLuongPhanTram = CalculatePercent(summary.ChatLuongDiem, diemCoSoTong);
            summary.TienDoPhanTram = CalculatePercent(summary.TienDoDiem, diemCoSoTong);
            summary.DiemTieuChiKetQua = coApDungHeSo
                ? (summary.KhoiLuongPhanTram + summary.ChatLuongPhanTram + summary.TienDoPhanTram
                    + (model.KetQuaLinhVucPhanTram ?? 0d)
                    + (model.KhaNangToChucPhanTram ?? 0d)
                    + (model.NangLucTapHopPhanTram ?? 0d)) / 6d
                : (summary.KhoiLuongPhanTram + summary.ChatLuongPhanTram + summary.TienDoPhanTram) / 3d;

            return summary;
        }

        private static double CalculatePercent(double numerator, double denominator)
        {
            return denominator == 0d ? 0d : numerator / denominator * 100d;
        }

        private static void ValidateScore(string fieldName, double? actual, double? expected)
        {
            if (actual.HasValue != expected.HasValue
                || actual.HasValue && expected.HasValue && Math.Abs(actual.Value - expected.Value) > ScoreTolerance)
            {
                throw new ArgumentException($"Dữ liệu {fieldName} không khớp với điểm nhiệm vụ.");
            }
        }

        private sealed class HeSoContext
        {
            public KPI_LyLich2C Profile { get; init; } = null!;
            public Guid IdDotDanhGia { get; init; }
            public KPI_CauHinhDiemTheoHeSoLanhDao? Config { get; init; }
            public bool HasConfig { get; init; }
        }

        private sealed class TaskScoreRow
        {
            public Guid Id { get; init; }
            public double? DiemTheoBoTieuChi { get; init; }
            public double? ChamDiemSoLuong_HoanThanh { get; init; }
            public double? ChamDiemSoLuong_KhongHoanThanh { get; init; }
            public double? ChamDiemChatLuong_KhongDat { get; init; }
            public double? ChamDiemTienDo_KhongDat { get; init; }
            public double? ChamDiemChatLuong_SoDiemConLai { get; init; }
            public double? ChamDiemTienDo_SoDiemConLai { get; init; }
        }

        private sealed class ScoreRow
        {
            public double? DiemTheoBoTieuChi { get; init; }
            public double? ChamDiemSoLuong_HoanThanh { get; init; }
            public double? ChamDiemChatLuong_KhongDat { get; init; }
            public double? ChamDiemTienDo_KhongDat { get; init; }
        }

        private sealed class ScoreSummary
        {
            public double DiemBoTieuChi { get; set; }
            public double DiemHeSoLanhDao { get; set; }
            public double KhoiLuongDiem { get; set; }
            public double KhoiLuongPhanTram { get; set; }
            public double ChatLuongDiem { get; set; }
            public double ChatLuongPhanTram { get; set; }
            public double TienDoDiem { get; set; }
            public double TienDoPhanTram { get; set; }
            public double DiemTieuChiKetQua { get; set; }
        }
    }
}
