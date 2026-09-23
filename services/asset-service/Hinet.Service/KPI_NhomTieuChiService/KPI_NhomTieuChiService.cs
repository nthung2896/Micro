using CommonHelper.String;
using Elastic.Clients.Elasticsearch;
using Hinet.Model.Entities;
using Hinet.Repository.KPI_NhomTieuChiRepository;
using Hinet.Repository.KPI_DotDanhGia_DonViRepository;
using Hinet.Repository.KPI_LyLich2CRepository;
using Hinet.Repository.KPI_PhieuDanhGiaRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Dto;
using Hinet.Service.KPI_NhomTieuChiService.Dto;
using Hinet.Service.KPI_NhomTieuChiService.Request;
using Microsoft.EntityFrameworkCore;

using Hinet.Repository.DepartmentRepository;
using Hinet.Repository.KPI_DotTheoDoiDanhGiaRepository;

namespace Hinet.Service.KPI_NhomTieuChiService
{
    public class KPI_NhomTieuChiService : Service<KPI_NhomTieuChi>, IKPI_NhomTieuChiService
    {
        private readonly ElasticsearchClient _elasticClient;
        private readonly IKPI_DotDanhGia_DonViRepository _dotDanhGiaDonViRepository;
        private readonly IKPI_LyLich2CRepository _lyLich2CRepository;
        private readonly IKPI_PhieuDanhGiaRepository _phieuDanhGiaRepository;
        private readonly IKPI_DotTheoDoiDanhGiaRepository _dotTheoDoiDanhGiaRepository;
        private readonly IDepartmentRepository _departmentRepository;

        public KPI_NhomTieuChiService(
            IKPI_NhomTieuChiRepository kPI_NhomTieuChiRepository,
            ElasticsearchClient elasticClient,
            IKPI_DotDanhGia_DonViRepository dotDanhGiaDonViRepository,
            IKPI_LyLich2CRepository lyLich2CRepository,
            IKPI_PhieuDanhGiaRepository phieuDanhGiaRepository,
            IKPI_DotTheoDoiDanhGiaRepository dotTheoDoiDanhGiaRepository,
            IDepartmentRepository departmentRepository
            ) : base(kPI_NhomTieuChiRepository)
        {
            _elasticClient = elasticClient;
            _dotDanhGiaDonViRepository = dotDanhGiaDonViRepository;
            _lyLich2CRepository = lyLich2CRepository;
            _phieuDanhGiaRepository = phieuDanhGiaRepository;
            _dotTheoDoiDanhGiaRepository = dotTheoDoiDanhGiaRepository;
            _departmentRepository = departmentRepository;
        }

        public async Task<PagedList<KPI_NhomTieuChiDto>> GetData(KPI_NhomTieuChiSearch search)
        {
            var query = from q in GetQueryable()

                        select new KPI_NhomTieuChiDto()
                        {
                            TenNhomTieuChi = q.TenNhomTieuChi,
                            CongViecChiTiet = q.CongViecChiTiet,
                            SanPhamDauRa = q.SanPhamDauRa,
                            PhanNhom = q.PhanNhom,
                            KhungDiemToiDa = q.KhungDiemToiDa,
                            Diem = q.Diem,
                            HeSoQuyDoi = q.HeSoQuyDoi,
                            GhiChu = q.GhiChu,
                            ParentID = q.ParentID,
                            Level = q.Level,
                            STT = q.STT,
                            IdDonVi = q.IdDonVi,
                            IdBoTieuChiDonVi = q.IdBoTieuChiDonVi,
                            CreatedBy = q.CreatedBy,
                            UpdatedBy = q.UpdatedBy,
                            IsDeleted = q.IsDeleted,
                            DeletedId = q.DeletedId,
                            CreatedDate = q.CreatedDate,
                            UpdatedDate = q.UpdatedDate,
                            DeletedDate = q.DeletedDate,
                            Id = q.Id,
                        };


            if (search != null && search.IsElastic == true)
            {
                var elasticResponse = await _elasticClient.SearchAsync<KPI_NhomTieuChiDto>(s => s
                    .Index("kpi_nhomtieuchi_index")
                    .Query(q => q.Bool(b =>
                    {
                        var mustClauses = new List<Action<Elastic.Clients.Elasticsearch.QueryDsl.QueryDescriptor<KPI_NhomTieuChiDto>>>();

                        if (search.IdBoTieuChiDonVi.HasValue)
                        {
                            mustClauses.Add(mq => mq.Term(m => m.Field("idBoTieuChiDonVi.keyword").Value(search.IdBoTieuChiDonVi.Value.ToString())));
                        }

                        if (search.Level.HasValue)
                        {
                            mustClauses.Add(mq => mq.Term(m => m.Field("level").Value(search.Level.Value)));
                        }

                        if (!string.IsNullOrEmpty(search.Keyword))
                        {
                            var val = search.Keyword.ConvertToUnsign();
                            mustClauses.Add(mq => mq.MultiMatch(m => m
                                .Fields(new[] { "tenNhomTieuChiKhongDau", "congViecChiTietKhongDau", "sanPhamDauRaKhongDau" })
                                .Query(val)
                            ));
                        }

                        if (!string.IsNullOrEmpty(search.TenNhomTieuChi))
                        {
                            var val = search.TenNhomTieuChi.ConvertToUnsign();
                            mustClauses.Add(mq => mq.Match(m => m.Field("tenNhomTieuChiKhongDau").Query(val)));
                        }

                        if (!string.IsNullOrEmpty(search.CongViecChiTiet))
                        {
                            var val = search.CongViecChiTiet.ConvertToUnsign();
                            mustClauses.Add(mq => mq.Match(m => m.Field("congViecChiTietKhongDau").Query(val)));
                        }

                        if (!string.IsNullOrEmpty(search.SanPhamDauRa))
                        {
                            var val = search.SanPhamDauRa.ConvertToUnsign();
                            mustClauses.Add(mq => mq.Match(m => m.Field("sanPhamDauRaKhongDau").Query(val)));
                        }

                        if (mustClauses.Any())
                        {
                            b.Must(mustClauses.ToArray());
                        }
                    }))
                    .From((search.PageIndex - 1) * search.PageSize)
                    .Size(search.PageSize)
                    .Sort(srt => srt
                        .Field(f => f.Field(x => x.STT).Order(Elastic.Clients.Elasticsearch.SortOrder.Asc).Missing("_last"))
                        .Field(f => f.Field(x => x.CreatedDate).Order(Elastic.Clients.Elasticsearch.SortOrder.Desc))
                    )
                );

                var items = elasticResponse.Documents.ToList();
                var total = (int)elasticResponse.Total;

                return new PagedList<KPI_NhomTieuChiDto>(items, search.PageIndex, search.PageSize, total);
            }

            if (search != null)
            {
                if (search.IdBoTieuChiDonVi.HasValue)
                {
                    query = query.Where(x => x.IdBoTieuChiDonVi == search.IdBoTieuChiDonVi);
                }
                if (!string.IsNullOrEmpty(search.Keyword))
                {
                    query = query.Where(x =>
                        EF.Functions.Like(x.TenNhomTieuChi, $"%{search.Keyword}%") ||
                        EF.Functions.Like(x.CongViecChiTiet, $"%{search.Keyword}%") ||
                        EF.Functions.Like(x.SanPhamDauRa, $"%{search.Keyword}%") ||
                        EF.Functions.Like(x.PhanNhom, $"%{search.Keyword}%")
                    );
                }
                if (!string.IsNullOrEmpty(search.TenNhomTieuChi))
                {
                    query = query.Where(x => EF.Functions.Like(x.TenNhomTieuChi, $"%{search.TenNhomTieuChi}%"));
                }
                if (!string.IsNullOrEmpty(search.CongViecChiTiet))
                {
                    query = query.Where(x => EF.Functions.Like(x.CongViecChiTiet, $"%{search.CongViecChiTiet}%"));
                }
                if (!string.IsNullOrEmpty(search.SanPhamDauRa))
                {
                    query = query.Where(x => EF.Functions.Like(x.SanPhamDauRa, $"%{search.SanPhamDauRa}%"));
                }
                if (!string.IsNullOrEmpty(search.PhanNhom))
                {
                    query = query.Where(x => EF.Functions.Like(x.PhanNhom, $"%{search.PhanNhom}%"));
                }
            }
            query = query.OrderBy(x => x.STT ?? int.MaxValue).ThenByDescending(x => x.CreatedDate);
            var result = await PagedList<KPI_NhomTieuChiDto>.CreateAsync(query, search);
            return result;
        }

        public async Task<PagedList<KPI_NhomTieuChiDto>> GetDataElasticExact(KPI_NhomTieuChiSearch search)
        {
            var elasticResponse = await _elasticClient.SearchAsync<KPI_NhomTieuChiDto>(s => s
                .Index("kpi_nhomtieuchi_index")
                .Query(q => q.Bool(b =>
                {
                    var mustClauses = new List<Action<Elastic.Clients.Elasticsearch.QueryDsl.QueryDescriptor<KPI_NhomTieuChiDto>>>();

                    if (search.IdBoTieuChiDonVi.HasValue)
                    {
                        mustClauses.Add(mq => mq.Term(m => m.Field("idBoTieuChiDonVi.keyword").Value(search.IdBoTieuChiDonVi.Value.ToString())));
                    }
                    if (search.Level.HasValue)
                    {
                        mustClauses.Add(mq => mq.Term(m => m.Field("level").Value(search.Level.Value)));
                    }
                    if (search.ParentID.HasValue)
                    {
                        mustClauses.Add(mq => mq.Term(m => m.Field("parentID.keyword").Value(search.ParentID.Value.ToString())));
                    }
                    if (!string.IsNullOrEmpty(search.Keyword))
                    {
                        var val = search.Keyword.ConvertToUnsign();
                        mustClauses.Add(mq => mq.MultiMatch(m => m
                            .Fields(new[] { "tenNhomTieuChiKhongDau", "congViecChiTietKhongDau", "sanPhamDauRaKhongDau" })
                            .Query(val)
                            .Type(Elastic.Clients.Elasticsearch.QueryDsl.TextQueryType.PhrasePrefix)
                        ));
                    }
                    if (!string.IsNullOrEmpty(search.TenNhomTieuChi))
                    {
                        var val = search.TenNhomTieuChi.ConvertToUnsign();
                        mustClauses.Add(mq => mq.MatchPhrasePrefix(m => m.Field("tenNhomTieuChiKhongDau").Query(val)));
                    }
                    if (!string.IsNullOrEmpty(search.CongViecChiTiet))
                    {
                        var val = search.CongViecChiTiet.ConvertToUnsign();
                        mustClauses.Add(mq => mq.MatchPhrasePrefix(m => m.Field("congViecChiTietKhongDau").Query(val)));
                    }
                    if (!string.IsNullOrEmpty(search.SanPhamDauRa))
                    {
                        var val = search.SanPhamDauRa.ConvertToUnsign();
                        mustClauses.Add(mq => mq.MatchPhrasePrefix(m => m.Field("sanPhamDauRaKhongDau").Query(val)));
                    }

                    if (mustClauses.Any())
                    {
                        b.Must(mustClauses.ToArray());
                    }
                }))
                .From((search.PageIndex - 1) * search.PageSize)
                .Size(search.PageSize)
            );

            var items = elasticResponse.Documents.ToList();
            var total = (int)elasticResponse.Total;

            return new PagedList<KPI_NhomTieuChiDto>(items, search.PageIndex, search.PageSize, total);
        }

        public async Task<List<Guid>> GetDeXuatTieuChiElastic(string? tenNhiemVu, string? tenSanPham, Guid? idBoTieuChiDonVi, List<Guid>? relatedIds = null)
        {
            if (string.IsNullOrWhiteSpace(tenNhiemVu) && string.IsNullOrWhiteSpace(tenSanPham) && (relatedIds == null || !relatedIds.Any())) return new List<Guid>();

            List<Guid> parentIds = new List<Guid>();
            if (relatedIds != null && relatedIds.Any())
            {
                parentIds = await GetQueryable().Where(x => relatedIds.Contains(x.Id) && x.ParentID.HasValue).Select(x => x.ParentID.Value).Distinct().ToListAsync();
            }

            var elasticResponse = await _elasticClient.SearchAsync<KPI_NhomTieuChiDto>(s => s
                .Index("kpi_nhomtieuchi_index")
                .Query(q => q.Bool(b =>
                {
                    var mustClauses = new List<Action<Elastic.Clients.Elasticsearch.QueryDsl.QueryDescriptor<KPI_NhomTieuChiDto>>>();
                    var shouldClauses = new List<Action<Elastic.Clients.Elasticsearch.QueryDsl.QueryDescriptor<KPI_NhomTieuChiDto>>>();

                    if (idBoTieuChiDonVi.HasValue)
                    {
                        mustClauses.Add(mq => mq.Term(m => m.Field("idBoTieuChiDonVi.keyword").Value(idBoTieuChiDonVi.Value.ToString())));
                    }

                    if (!string.IsNullOrWhiteSpace(tenNhiemVu))
                    {
                        var valNV = tenNhiemVu.ConvertToUnsign();
                        shouldClauses.Add(sq => sq.MatchPhrasePrefix(m => m.Field("tenNhomTieuChiKhongDau").Query(valNV).Boost(3.0f)));
                        shouldClauses.Add(sq => sq.Match(m => m.Field("tenNhomTieuChiKhongDau").Query(valNV).MinimumShouldMatch("70%")));
                    }

                    if (!string.IsNullOrWhiteSpace(tenSanPham))
                    {
                        var valSP = tenSanPham.ConvertToUnsign();
                        shouldClauses.Add(sq => sq.MatchPhrasePrefix(m => m.Field("sanPhamDauRaKhongDau").Query(valSP).Boost(3.0f)));
                        shouldClauses.Add(sq => sq.Match(m => m.Field("sanPhamDauRaKhongDau").Query(valSP).MinimumShouldMatch("70%")));
                    }

                    if (parentIds.Any())
                    {
                        shouldClauses.Add(sq => sq.Terms(t => t.Field("parentID.keyword").Terms(new Elastic.Clients.Elasticsearch.QueryDsl.TermsQueryField(parentIds.Select(p => (Elastic.Clients.Elasticsearch.FieldValue)p.ToString()).ToList()))));
                    }

                    if (shouldClauses.Any())
                    {
                        mustClauses.Add(mq => mq.Bool(innerB => innerB.Should(shouldClauses.ToArray()).MinimumShouldMatch(1)));
                    }

                    b.Must(mustClauses.ToArray());
                }))
                .MinScore(3.0) 
                .Size(50) 
            );

            return elasticResponse.Documents.Select(x => x.Id).ToList();
        }

        public async Task<List<KPI_NhomTieuChiDto>> GetTop3DeXuatTieuChiElastic(string? tenNhiemVu, string? tenSanPham, Guid? idBoTieuChiDonVi, List<Guid>? relatedIds = null)
        {
            if (string.IsNullOrWhiteSpace(tenNhiemVu) && string.IsNullOrWhiteSpace(tenSanPham) && (relatedIds == null || !relatedIds.Any())) return new List<KPI_NhomTieuChiDto>();

            List<Guid> parentIds = new List<Guid>();
            if (relatedIds != null && relatedIds.Any())
            {
                parentIds = await GetQueryable().Where(x => relatedIds.Contains(x.Id) && x.ParentID.HasValue).Select(x => x.ParentID.Value).Distinct().ToListAsync();
            }

            var elasticResponse = await _elasticClient.SearchAsync<KPI_NhomTieuChiDto>(s => s
                .Index("kpi_nhomtieuchi_index")
                .Query(q => q.Bool(b =>
                {
                    var mustClauses = new List<Action<Elastic.Clients.Elasticsearch.QueryDsl.QueryDescriptor<KPI_NhomTieuChiDto>>>();
                    var shouldClauses = new List<Action<Elastic.Clients.Elasticsearch.QueryDsl.QueryDescriptor<KPI_NhomTieuChiDto>>>();

                    if (idBoTieuChiDonVi.HasValue)
                    {
                        mustClauses.Add(mq => mq.Term(m => m.Field("idBoTieuChiDonVi.keyword").Value(idBoTieuChiDonVi.Value.ToString())));
                    }
                    
                    // Chỉ lấy Level 4 (Sản phẩm đầu ra)
                    mustClauses.Add(mq => mq.Term(m => m.Field("level").Value(4)));

                    if (!string.IsNullOrWhiteSpace(tenNhiemVu))
                    {
                        var valNV = tenNhiemVu.ConvertToUnsign();
                        shouldClauses.Add(sq => sq.MatchPhrasePrefix(m => m.Field("congViecChiTietKhongDau").Query(valNV).Boost(3.0f)));
                        shouldClauses.Add(sq => sq.Match(m => m.Field("congViecChiTietKhongDau").Query(valNV).MinimumShouldMatch("70%")));
                    }

                    if (!string.IsNullOrWhiteSpace(tenSanPham))
                    {
                        var valSP = tenSanPham.ConvertToUnsign();
                        shouldClauses.Add(sq => sq.MatchPhrasePrefix(m => m.Field("sanPhamDauRaKhongDau").Query(valSP).Boost(5.0f)));
                        shouldClauses.Add(sq => sq.Match(m => m.Field("sanPhamDauRaKhongDau").Query(valSP).MinimumShouldMatch("70%")));
                    }

                    if (parentIds.Any())
                    {
                        shouldClauses.Add(sq => sq.Terms(t => t.Field("parentID.keyword").Terms(new Elastic.Clients.Elasticsearch.QueryDsl.TermsQueryField(parentIds.Select(p => (Elastic.Clients.Elasticsearch.FieldValue)p.ToString()).ToList()))));
                    }

                    if (shouldClauses.Any())
                    {
                        mustClauses.Add(mq => mq.Bool(innerB => innerB.Should(shouldClauses.ToArray()).MinimumShouldMatch(1)));
                    }

                    b.Must(mustClauses.ToArray());
                }))
                .MinScore(2.0)
                .Size(3) // Chỉ lấy top 3
            );

            var top3 = elasticResponse.Documents.ToList();

            if (top3.Any())
            {
                var idBoTieuChiDonVis = top3.Where(x => x.IdBoTieuChiDonVi.HasValue).Select(x => x.IdBoTieuChiDonVi.Value).Distinct().ToList();
                var allData = await GetQueryable().Where(x => x.IdBoTieuChiDonVi.HasValue && idBoTieuChiDonVis.Contains(x.IdBoTieuChiDonVi.Value)).ToListAsync();
                var dict = allData.ToDictionary(x => x.Id);

                foreach (var item in top3)
                {
                    var names = new List<string>();
                    var parentId = item.ParentID;
                    while (parentId.HasValue && dict.ContainsKey(parentId.Value))
                    {
                        var parent = dict[parentId.Value];
                        var name = parent.TenNhomTieuChi ?? parent.CongViecChiTiet ?? parent.SanPhamDauRa;
                        if (!string.IsNullOrWhiteSpace(name))
                        {
                            names.Insert(0, name);
                        }
                        parentId = parent.ParentID;
                    }
                    
                    var currentName = item.TenNhomTieuChi ?? item.CongViecChiTiet ?? item.SanPhamDauRa;
                    if (!string.IsNullOrWhiteSpace(currentName))
                    {
                        names.Add(currentName);
                    }

                    for (int i = 0; i < names.Count; i++)
                    {
                        if (i == 0) item.Level1Name = names[i];
                        else if (i == 1) item.Level2Name = names[i];
                        else if (i == 2) item.Level3Name = names[i];
                        else if (i == 3) item.Level4Name = names[i];
                        else if (i == 4) item.Level5Name = names[i];
                    }
                }
            }

            return top3;
        }

        public async Task<KPI_NhomTieuChiDto?> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)

                              select new KPI_NhomTieuChiDto()
                              {
                                  TenNhomTieuChi = q.TenNhomTieuChi,
                                  CongViecChiTiet = q.CongViecChiTiet,
                                  SanPhamDauRa = q.SanPhamDauRa,
                                  PhanNhom = q.PhanNhom,
                                  KhungDiemToiDa = q.KhungDiemToiDa,
                                  Diem = q.Diem,
                                  HeSoQuyDoi = q.HeSoQuyDoi,
                                  GhiChu = q.GhiChu,
                                  ParentID = q.ParentID,
                                  Level = q.Level,
                                  STT = q.STT,
                                  IdDonVi = q.IdDonVi,
                                  IdBoTieuChiDonVi = q.IdBoTieuChiDonVi,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy,
                                  IsDeleted = q.IsDeleted,
                                  DeletedId = q.DeletedId,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  DeletedDate = q.DeletedDate,
                                  Id = q.Id,
                              }).FirstOrDefaultAsync();

            return item;
        }

        public async Task<List<KPI_NhomTieuChiDto>> GetTreeDataForDot(Guid idDot, Guid? idLyLich, Guid? idPhieuDanhGia)
        {
            Guid? idDonVi = null;
            Guid? idPhongBan = null;
            if (idPhieuDanhGia.HasValue)
            {
                var phieu = await _phieuDanhGiaRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == idPhieuDanhGia.Value);
                if (phieu != null)
                {
                    idDonVi = phieu.DonVi;
                    if (phieu.IdLyLich.HasValue)
                    {
                        var ll = await _lyLich2CRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == phieu.IdLyLich.Value || x.UserId == phieu.IdLyLich.Value);
                        if (ll != null)
                        {
                            if (idDonVi == null || idDonVi == Guid.Empty) idDonVi = ll.DonViSuDungId;
                            if (ll.PhongBanId != Guid.Empty) idPhongBan = ll.PhongBanId;
                        }
                    }
                }
            }
            else if (idLyLich.HasValue)
            {
                var ll = await _lyLich2CRepository.GetQueryable().FirstOrDefaultAsync(x => x.Id == idLyLich.Value || x.UserId == idLyLich.Value);
                if (ll != null)
                {
                    idDonVi = ll.DonViSuDungId;
                    if (ll.PhongBanId != Guid.Empty) idPhongBan = ll.PhongBanId;
                }
            }

            if (idDonVi == null && idPhongBan == null)
            {
                return new List<KPI_NhomTieuChiDto>();
            }

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
            if (deptHierarchy.Any())
            {
                var dotDonVis = await _dotDanhGiaDonViRepository.GetQueryable()
                    .Where(x => x.IdDotDanhGia == idDot && deptHierarchy.Contains(x.IdDonVi) && x.IdBoChiSoNhiemVu.HasValue)
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

            if (!targetBoTieuChiId.HasValue)
            {
                var dotTheoDoi = await _dotTheoDoiDanhGiaRepository.GetQueryable()
                                    .FirstOrDefaultAsync(x => x.Id == idDot);
                targetBoTieuChiId = dotTheoDoi?.DefaultTieuChiDonVi;
            }

            if (!targetBoTieuChiId.HasValue)
            {
                var latestBoId = await GetQueryable()
                    .Where(x => !x.IsDeleted && x.IdBoTieuChiDonVi.HasValue)
                    .OrderByDescending(x => x.CreatedDate)
                    .Select(x => x.IdBoTieuChiDonVi)
                    .FirstOrDefaultAsync();
                targetBoTieuChiId = latestBoId;
            }

            if (!targetBoTieuChiId.HasValue)
            {
                return new List<KPI_NhomTieuChiDto>();
            }

            // 2. Get criteria for this targetBoTieuChiId
            var criteriaList = await GetQueryable()
                                .Where(x => x.IdBoTieuChiDonVi == targetBoTieuChiId.Value && x.IsDeleted == false)
                                .Select(x => new KPI_NhomTieuChiDto
                                {
                                    Id = x.Id,
                                    TenNhomTieuChi = x.TenNhomTieuChi,
                                    CongViecChiTiet = x.CongViecChiTiet,
                                    SanPhamDauRa = x.SanPhamDauRa,
                                    Level = x.Level,
                                    ParentID = x.ParentID,
                                    STT = x.STT,
                                    Diem = x.Diem,
                                    KhungDiemToiDa = x.KhungDiemToiDa,
                                    IdBoTieuChiDonVi = x.IdBoTieuChiDonVi,
                                    CreatedDate = x.CreatedDate
                                })
                                .ToListAsync();

            var sortedData = criteriaList
                .OrderBy(x => x.STT ?? int.MaxValue)
                .ThenBy(x => x.Level)
                .ThenBy(x => x.TenNhomTieuChi ?? x.CongViecChiTiet ?? x.SanPhamDauRa ?? "")
                .ThenByDescending(x => x.CreatedDate)
                .ToList();

            return sortedData;
        }

        public async Task<bool> SyncToElastic(Guid? idBoTieuChiDonVi = null)
        {
            var query = GetQueryable().Where(x => !x.IsDeleted);
            if (idBoTieuChiDonVi.HasValue)
            {
                query = query.Where(x => x.IdBoTieuChiDonVi == idBoTieuChiDonVi.Value);
            }

            var allData = await query.AsNoTracking().ToListAsync();

            var dict = allData.ToDictionary(x => x.Id);
            var dtoList = new List<KPI_NhomTieuChiDto>();
            var syncVersion = Guid.NewGuid().ToString("N");

            foreach (var item in allData)
            {
                var dto = new KPI_NhomTieuChiDto
                {
                    Id = item.Id,
                    TenNhomTieuChi = item.TenNhomTieuChi,
                    CongViecChiTiet = item.CongViecChiTiet,
                    SanPhamDauRa = item.SanPhamDauRa,
                    PhanNhom = item.PhanNhom,
                    KhungDiemToiDa = item.KhungDiemToiDa,
                    Diem = item.Diem,
                    HeSoQuyDoi = item.HeSoQuyDoi,
                    GhiChu = item.GhiChu,
                    ParentID = item.ParentID,
                    Level = item.Level,
                    STT = item.STT,
                    IdDonVi = item.IdDonVi,
                    IdBoTieuChiDonVi = item.IdBoTieuChiDonVi,
                    CreatedBy = item.CreatedBy,
                    UpdatedBy = item.UpdatedBy,
                    IsDeleted = item.IsDeleted,
                    CreatedDate = item.CreatedDate,
                    UpdatedDate = item.UpdatedDate,
                    TenNhomTieuChiKhongDau = !string.IsNullOrWhiteSpace(item.TenNhomTieuChi) ? item.TenNhomTieuChi.ConvertToUnsign() : "",
                    CongViecChiTietKhongDau = !string.IsNullOrWhiteSpace(item.CongViecChiTiet) ? item.CongViecChiTiet.ConvertToUnsign() : "",
                    SanPhamDauRaKhongDau = !string.IsNullOrWhiteSpace(item.SanPhamDauRa) ? item.SanPhamDauRa.ConvertToUnsign() : "",
                    SyncVersion = syncVersion
                };

                var names = new List<string>();
                var parentId = item.ParentID;
                while (parentId.HasValue && dict.ContainsKey(parentId.Value))
                {
                    var parent = dict[parentId.Value];
                    var name = parent.TenNhomTieuChi ?? parent.CongViecChiTiet ?? parent.SanPhamDauRa;
                    if (!string.IsNullOrWhiteSpace(name))
                    {
                        names.Insert(0, name);
                    }
                    parentId = parent.ParentID;
                }

                var currentName = item.TenNhomTieuChi ?? item.CongViecChiTiet ?? item.SanPhamDauRa;
                if (!string.IsNullOrWhiteSpace(currentName))
                {
                    names.Add(currentName);
                }

                for (int i = 0; i < names.Count; i++)
                {
                    if (i == 0) dto.Level1Name = names[i];
                    else if (i == 1) dto.Level2Name = names[i];
                    else if (i == 2) dto.Level3Name = names[i];
                    else if (i == 3) dto.Level4Name = names[i];
                    else if (i == 4) dto.Level5Name = names[i];
                }

                dtoList.Add(dto);
            }

            int batchSize = 500;
            string indexName = "kpi_nhomtieuchi_index";

            if (dtoList.Any())
            {
                for (int i = 0; i < dtoList.Count; i += batchSize)
                {
                    var batch = dtoList.Skip(i).Take(batchSize).ToList();
                    var bulkResponse = await _elasticClient.BulkAsync(b => b
                        .Index(indexName)
                        .Refresh(Refresh.WaitFor)
                        .IndexMany(batch, (descriptor, doc) => descriptor.Id(doc.Id.ToString())));

                    if (!bulkResponse.IsValidResponse || bulkResponse.Errors)
                    {
                        return false;
                    }
                }
            }

            var indexExists = await _elasticClient.Indices.ExistsAsync(indexName);
            if (indexExists.Exists)
            {
                if (idBoTieuChiDonVi.HasValue)
                {
                    await _elasticClient.DeleteByQueryAsync<KPI_NhomTieuChiDto>(indexName, d => d
                        .Conflicts(Conflicts.Proceed)
                        .Query(q => q.Bool(b => b
                            .Filter(f => f.Term(t => t
                                .Field("idBoTieuChiDonVi.keyword")
                                .Value(idBoTieuChiDonVi.Value.ToString())))
                            .MustNot(m => m.Term(t => t
                                .Field("syncVersion.keyword")
                                .Value(syncVersion)))))
                        .Refresh(true));
                }
                else
                {
                    await _elasticClient.DeleteByQueryAsync<KPI_NhomTieuChiDto>(indexName, d => d
                        .Conflicts(Conflicts.Proceed)
                        .Query(q => q.Bool(b => b
                            .MustNot(m => m.Term(t => t
                                .Field("syncVersion.keyword")
                                .Value(syncVersion)))))
                        .Refresh(true));
                }
            }

            return true;
        }

    }
}


