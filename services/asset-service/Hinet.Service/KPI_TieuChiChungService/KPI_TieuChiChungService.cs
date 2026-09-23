using Hinet.Model.Entities;
using Hinet.Repository.KPI_TieuChiChungRepository;
using Hinet.Service.Common.Service;
using Hinet.Service.KPI_TieuChiChungService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Dto;
using Microsoft.EntityFrameworkCore;
using Hinet.Repository.KPI_BoTieuChiChungRepository;
using Hinet.Repository.KPI_TieuChiChung_DiemSoRepository;
using Hinet.Repository.KPI_DotDanhGia_DonViRepository;
using Hinet.Repository.KPI_LyLich2CRepository;
using Hinet.Repository.KPI_PhieuDanhGiaRepository;

using Hinet.Repository.KPI_DotTheoDoiDanhGiaRepository;

namespace Hinet.Service.KPI_TieuChiChungService
{
    public class KPI_TieuChiChungService : Service<KPI_TieuChiChung>, IKPI_TieuChiChungService
    {
        private readonly IKPI_BoTieuChiChungRepository _boTieuChiChungRepository;
        private readonly IKPI_TieuChiChung_DiemSoRepository _diemSoRepository;
        private readonly IKPI_DotDanhGia_DonViRepository _dotDanhGiaDonViRepository;
        private readonly IKPI_LyLich2CRepository _lyLich2CRepository;
        private readonly IKPI_PhieuDanhGiaRepository _phieuDanhGiaRepository;
        private readonly IKPI_DotTheoDoiDanhGiaRepository _dotTheoDoiDanhGiaRepository;
        
        public KPI_TieuChiChungService(
            IKPI_TieuChiChungRepository kPI_TieuChiChungRepository,
            IKPI_BoTieuChiChungRepository boTieuChiChungRepository,
            IKPI_TieuChiChung_DiemSoRepository diemSoRepository,
            IKPI_DotDanhGia_DonViRepository dotDanhGiaDonViRepository,
            IKPI_LyLich2CRepository lyLich2CRepository,
            IKPI_PhieuDanhGiaRepository phieuDanhGiaRepository,
            IKPI_DotTheoDoiDanhGiaRepository dotTheoDoiDanhGiaRepository
            ) : base(kPI_TieuChiChungRepository)
        {
            _boTieuChiChungRepository = boTieuChiChungRepository;
            _diemSoRepository = diemSoRepository;
            _dotDanhGiaDonViRepository = dotDanhGiaDonViRepository;
            _lyLich2CRepository = lyLich2CRepository;
            _phieuDanhGiaRepository = phieuDanhGiaRepository;
            _dotTheoDoiDanhGiaRepository = dotTheoDoiDanhGiaRepository;
        }

        public async Task<PagedList<KPI_TieuChiChungDto>> GetData(KPI_TieuChiChungSearch search)
        {
            var query = from q in GetQueryable()
                        join p in GetQueryable() on q.ParentId equals p.Id into pj
                        from parentItem in pj.DefaultIfEmpty()
                        join b in _boTieuChiChungRepository.GetQueryable() on q.IdBoTieuChiChung equals b.Id into bj
                        from btc in bj.DefaultIfEmpty()
                        select new KPI_TieuChiChungDto()
                        {
                            Ten = q.Ten,
                            ParentId = q.ParentId,
                            TenParent = parentItem != null ? parentItem.Ten : null,
                            MyProperty = q.MyProperty,
                            IdBoTieuChiChung = q.IdBoTieuChiChung,
                            TenBoTieuChiChung = btc != null ? btc.TenBoTieuChiDonVi : null,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                            Priority = q.Priority,
                        };
            if(search != null )
            {
                if(!string.IsNullOrEmpty(search.Ten))
				{
					query = query.Where(x => EF.Functions.Like(x.Ten, $"%{search.Ten}%"));
				}
                if(!string.IsNullOrEmpty(search.ParentId) && Guid.TryParse(search.ParentId, out var parentGuid))
				{
					query = query.Where(x => x.ParentId == parentGuid);
				}
				if(search.MyProperty.HasValue)
				{
					query = query.Where(x => x.MyProperty == search.MyProperty);
				}
				if(search.IdBoTieuChiChung.HasValue)
				{
					query = query.Where(x => x.IdBoTieuChiChung == search.IdBoTieuChiChung);
				}
            }
            query = query.OrderBy(x => x.Priority ?? int.MaxValue).ThenByDescending(x => x.CreatedDate);
            var result = await PagedList<KPI_TieuChiChungDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<KPI_TieuChiChungDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x=>x.Id == id)
                        join p in GetQueryable() on q.ParentId equals p.Id into pj
                        from parentItem in pj.DefaultIfEmpty()
                        join b in _boTieuChiChungRepository.GetQueryable() on q.IdBoTieuChiChung equals b.Id into bj
                        from btc in bj.DefaultIfEmpty()
                        select new KPI_TieuChiChungDto()
                        {
                            Ten = q.Ten,
                            ParentId = q.ParentId,
                            TenParent = parentItem != null ? parentItem.Ten : null,
                            MyProperty = q.MyProperty,
                            IdBoTieuChiChung = q.IdBoTieuChiChung,
                            TenBoTieuChiChung = btc != null ? btc.TenBoTieuChiDonVi : null,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            Id = q.Id,
                            Priority = q.Priority,
                        }).FirstOrDefaultAsync();
            
            return item;
        }

        public async Task<KPI_BoTieuChiChungApDungDto?> GetBoTieuChiChungApDungForDot(
            Guid idDot,
            Guid? idLyLich,
            Guid? idPhieuDanhGia,
            Guid? idDonVi = null)
        {
            KPI_LyLich2C? lyLich = null;
            if (idLyLich.HasValue && idLyLich.Value != Guid.Empty)
            {
                lyLich = await _lyLich2CRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == idLyLich.Value);
            }

            KPI_PhieuDanhGia? phieuDanhGia = null;
            if (idPhieuDanhGia.HasValue && idPhieuDanhGia.Value != Guid.Empty)
            {
                phieuDanhGia = await _phieuDanhGiaRepository.GetQueryable()
                    .FirstOrDefaultAsync(x => x.Id == idPhieuDanhGia.Value);

                if (lyLich == null && phieuDanhGia?.IdLyLich.HasValue == true)
                {
                    lyLich = await _lyLich2CRepository.GetQueryable()
                        .FirstOrDefaultAsync(x => x.Id == phieuDanhGia.IdLyLich.Value);
                }
            }

            // Bộ tiêu chí được cấu hình ở cấp cụ thể hơn được ưu tiên trước:
            // đơn vị trên phiếu/được truyền vào -> phòng ban -> đơn vị sử dụng.
            var donViTheoThuTuUuTien = new List<Guid>();
            void AddDonVi(Guid? value)
            {
                if (value.HasValue && value.Value != Guid.Empty && !donViTheoThuTuUuTien.Contains(value.Value))
                {
                    donViTheoThuTuUuTien.Add(value.Value);
                }
            }

            AddDonVi(idDonVi);
            if (!idDonVi.HasValue || idDonVi.Value == Guid.Empty)
            {
                AddDonVi(phieuDanhGia?.DonVi);
            }
            if (lyLich != null)
            {
                AddDonVi(lyLich.PhongBanId);
                AddDonVi(lyLich.DonViSuDungId);
            }

            Guid? idBoTieuChiChung = null;
            if (idDot != Guid.Empty && donViTheoThuTuUuTien.Count > 0)
            {
                var cauHinhTheoDonVi = await _dotDanhGiaDonViRepository.GetQueryable()
                    .Where(x => !x.IsDeleted
                        && x.IdDotDanhGia == idDot
                        && donViTheoThuTuUuTien.Contains(x.IdDonVi)
                        && x.IdBoTieuChiChung.HasValue
                        && x.IdBoTieuChiChung.Value != Guid.Empty)
                    .ToListAsync();

                foreach (var donVi in donViTheoThuTuUuTien)
                {
                    var cauHinh = cauHinhTheoDonVi.FirstOrDefault(x => x.IdDonVi == donVi);
                    if (cauHinh?.IdBoTieuChiChung.HasValue == true)
                    {
                        idBoTieuChiChung = cauHinh.IdBoTieuChiChung.Value;
                        break;
                    }
                }
            }

            var dot = await _dotTheoDoiDanhGiaRepository.GetQueryable()
                .FirstOrDefaultAsync(x => x.Id == idDot);
            var isTapThe = dot?.Type == "TapThe";

            if (!idBoTieuChiChung.HasValue && dot?.DefaultTieuChiChung.HasValue == true && dot.DefaultTieuChiChung.Value != Guid.Empty)
            {
                idBoTieuChiChung = dot.DefaultTieuChiChung;
            }

            if (!idBoTieuChiChung.HasValue || idBoTieuChiChung.Value == Guid.Empty)
            {
                // Fallback chuẩn: tìm bộ tiêu chí chung phù hợp theo loại (Tập thể / Cá nhân), đang kích hoạt và có tiêu chí con
                var queryBtc = _boTieuChiChungRepository.GetQueryable()
                    .Where(x => !x.IsDeleted && x.IsActive == true);

                if (isTapThe)
                {
                    queryBtc = queryBtc.Where(x => x.Type == "TapThe" || (x.TenBoTieuChiDonVi != null && EF.Functions.Like(x.TenBoTieuChiDonVi.ToLower(), "%tập thể%")));
                }
                else
                {
                    queryBtc = queryBtc.Where(x => x.Type != "TapThe");
                }

                // Ưu tiên bộ tiêu chí có dữ liệu tiêu chí con thực tế
                var validBtcIds = await GetQueryable()
                    .Where(x => !x.IsDeleted && x.IdBoTieuChiChung.HasValue)
                    .Select(x => x.IdBoTieuChiChung!.Value)
                    .Distinct()
                    .ToListAsync();

                idBoTieuChiChung = await queryBtc
                    .OrderByDescending(x => validBtcIds.Contains(x.Id))
                    .ThenByDescending(x => x.CreatedDate)
                    .Select(x => (Guid?)x.Id)
                    .FirstOrDefaultAsync();
            }

            if (!idBoTieuChiChung.HasValue || idBoTieuChiChung.Value == Guid.Empty)
            {
                return null;
            }

            var tenBoTieuChiChung = await _boTieuChiChungRepository.GetQueryable()
                .Where(x => x.Id == idBoTieuChiChung.Value)
                .Select(x => x.TenBoTieuChiDonVi)
                .FirstOrDefaultAsync();

            return new KPI_BoTieuChiChungApDungDto
            {
                IdBoTieuChiChung = idBoTieuChiChung.Value,
                TenBoTieuChiChung = tenBoTieuChiChung
            };
        }

        public async Task<List<KPI_TieuChiChungTreeDto>> GetTreeDataForBoTieuChiChung(
            Guid idBoTieuChiChung,
            IReadOnlyDictionary<Guid, decimal?>? diemTuChamTheoTieuChi = null)
        {
            if (idBoTieuChiChung == Guid.Empty)
            {
                return new List<KPI_TieuChiChungTreeDto>();
            }

            var criteriaList = await GetQueryable()
                .Where(x => x.IdBoTieuChiChung == idBoTieuChiChung)
                .OrderBy(x => x.Priority ?? int.MaxValue)
                .ThenBy(x => x.CreatedDate)
                .ToListAsync();

            var itemMap = new Dictionary<Guid, KPI_TieuChiChungTreeDto>();
            foreach (var item in criteriaList)
            {
                decimal? diemTuCham = null;
                if (diemTuChamTheoTieuChi != null
                    && diemTuChamTheoTieuChi.TryGetValue(item.Id, out var diemTuChamDaLuu))
                {
                    diemTuCham = diemTuChamDaLuu;
                }

                itemMap[item.Id] = new KPI_TieuChiChungTreeDto
                {
                    Id = item.Id,
                    Ten = item.Ten,
                    ParentId = item.ParentId,
                    MyProperty = item.MyProperty,
                    Priority = item.Priority,
                    IdBoTieuChiChung = item.IdBoTieuChiChung,
                    DiemTuCham = diemTuCham
                };
            }

            var tree = new List<KPI_TieuChiChungTreeDto>();
            foreach (var item in criteriaList)
            {
                var dto = itemMap[item.Id];
                if (item.ParentId.HasValue && itemMap.ContainsKey(item.ParentId.Value))
                {
                    itemMap[item.ParentId.Value].Children.Add(dto);
                }
                else
                {
                    tree.Add(dto);
                }
            }

            string[] romanNumerals = { "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV" };
            void AssignStt(List<KPI_TieuChiChungTreeDto> nodes, string parentStt = "", int level = 0)
            {
                for (var i = 0; i < nodes.Count; i++)
                {
                    var node = nodes[i];
                    if (level == 0)
                    {
                        node.Stt = i < romanNumerals.Length ? romanNumerals[i] : (i + 1).ToString();
                    }
                    else if (level == 1)
                    {
                        node.Stt = (i + 1).ToString();
                    }
                    else
                    {
                        node.Stt = string.IsNullOrEmpty(parentStt) ? (i + 1).ToString() : $"{parentStt}.{i + 1}";
                    }

                    if (node.Children.Count > 0)
                    {
                        AssignStt(node.Children, node.Stt, level + 1);
                    }
                }
            }

            AssignStt(tree);

            void CleanEmptyChildren(List<KPI_TieuChiChungTreeDto> nodes)
            {
                foreach (var node in nodes)
                {
                    if (node.Children.Count == 0)
                    {
                        node.Children = null;
                    }
                    else
                    {
                        CleanEmptyChildren(node.Children);
                    }
                }
            }

            CleanEmptyChildren(tree);
            return tree;
        }

        public async Task<List<KPI_TieuChiChungTreeDto>> GetTreeDataForDot(Guid idDot, Guid? idLyLich, Guid? idPhieuDanhGia, Guid? idDonVi = null)
        {
            var boTieuChiChung = await GetBoTieuChiChungApDungForDot(idDot, idLyLich, idPhieuDanhGia, idDonVi);
            if (boTieuChiChung == null)
            {
                return new List<KPI_TieuChiChungTreeDto>();
            }

            var scoresMap = new Dictionary<Guid, decimal?>();
            if (idPhieuDanhGia.HasValue || (idLyLich.HasValue && idDot != Guid.Empty))
            {
                var queryScores = _diemSoRepository.GetQueryable();
                List<KPI_TieuChiChung_DiemSo>? scores = null;
                if (idPhieuDanhGia.HasValue && idPhieuDanhGia.Value != Guid.Empty)
                {
                    scores = await queryScores
                        .Where(x => x.IdPhieuDanhGia == idPhieuDanhGia.Value)
                        .ToListAsync();
                }

                if ((scores == null || scores.Count == 0) && idLyLich.HasValue && idDot != Guid.Empty)
                {
                    scores = await queryScores
                        .Where(x => x.IdLyLich == idLyLich.Value && x.IdDotDanhGia == idDot)
                        .ToListAsync();
                }

                if (scores != null)
                {
                    foreach (var score in scores)
                    {
                        if (score.IdTieuChiChung.HasValue && score.DiemTuCham.HasValue)
                        {
                            scoresMap[score.IdTieuChiChung.Value] = score.DiemTuCham.Value;
                        }
                    }
                }
            }

            return await GetTreeDataForBoTieuChiChung(boTieuChiChung.IdBoTieuChiChung, scoresMap);
        }

    }
}
