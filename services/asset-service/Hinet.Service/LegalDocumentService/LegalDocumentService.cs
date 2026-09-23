using Hinet.Model.Entities;
using Hinet.Repository.LegalDocumentRepository;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Service.TaiLieuDinhKemService.Dto;
using Hinet.Service.LegalDocumentService.Dto;
using Hinet.Service.LegalDocumentService.Request;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Hinet.Repository.DM_DuLieuDanhMucRepository;
using Hinet.Repository.DM_NhomDanhMucRepository;

namespace Hinet.Service.LegalDocumentService
{
    public class LegalDocumentService : Service<LegalDocument>, ILegalDocumentService
    {
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IDM_DuLieuDanhMucRepository _dM_DuLieuDanhMucRepository;
        private readonly IDM_NhomDanhMucRepository _dM_NhomDanhMucRepository;

        public LegalDocumentService(
            ILegalDocumentRepository repository,
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IDM_DuLieuDanhMucRepository dM_DuLieuDanhMucRepository,
            IDM_NhomDanhMucRepository dM_NhomDanhMucRepository) : base(repository)
        {
            _taiLieuDinhKemService = taiLieuDinhKemService;
            _dM_DuLieuDanhMucRepository = dM_DuLieuDanhMucRepository;
            _dM_NhomDanhMucRepository = dM_NhomDanhMucRepository;
        }

        public async Task<PagedList<LegalDocumentDto>> GetData(LegalDocumentSearch search)
        {
            var baseQuery = from q in GetQueryable()

                            join dulieu in _dM_DuLieuDanhMucRepository.GetQueryable()
                                on q.LoaiHeThong equals dulieu.Code into jDuLieu
                            from dl in jDuLieu.DefaultIfEmpty()

                            join nhom in _dM_NhomDanhMucRepository.GetQueryable().Where(x => x.GroupCode == "LOAIHETHONGVANBAN")
                                on dl.GroupId equals nhom.Id into jNhom
                            from nh in jNhom.DefaultIfEmpty()

                            select new LegalDocumentDto
                            {
                                Id = q.Id,
                                LoaiVanBan = q.LoaiVanBan,
                                Code = q.Code,
                                PublicDate = q.PublicDate,
                                PublicBy = q.PublicBy,
                                ActivedDate = q.ActivedDate,
                                ExpiredDate = q.ExpiredDate,
                                SignedBy = q.SignedBy,
                                Document = q.Document,
                                Description = q.Description,
                                Content = q.Content,
                                Status = q.Status,
                                LoaiHeThong = q.LoaiHeThong,
                                LoaiHeThongName = nh != null && dl != null ? dl.Name : q.LoaiHeThong,
                                CreatedDate = q.CreatedDate,
                                UpdatedDate = q.UpdatedDate,
                                CreatedBy = q.CreatedBy,
                                UpdatedBy = q.UpdatedBy
                            };

            var query = ApplyFilter(baseQuery, search);
            query = query.OrderByDescending(x => x.PublicDate ?? x.CreatedDate);

            var result = await PagedList<LegalDocumentDto>.CreateAsync(query, search ?? new LegalDocumentSearch());

            foreach (var item in result.Items)
            {
                item.StatusName = GetStatusName(item.Status);
            }

            return result;
        }

        public async Task<LegalDocumentDto> GetDto(Guid id)
        {
            var item = await (from q in GetQueryable().Where(x => x.Id == id)

                              join dulieu in _dM_DuLieuDanhMucRepository.GetQueryable()
                                  on q.LoaiHeThong equals dulieu.Code into jDuLieu
                              from dl in jDuLieu.DefaultIfEmpty()

                              join nhom in _dM_NhomDanhMucRepository.GetQueryable().Where(x => x.GroupCode == "LOAIHETHONGVANBAN")
                                  on dl.GroupId equals nhom.Id into jNhom
                              from nh in jNhom.DefaultIfEmpty()

                              select new LegalDocumentDto
                              {
                                  Id = q.Id,
                                  LoaiVanBan = q.LoaiVanBan,
                                  Code = q.Code,
                                  PublicDate = q.PublicDate,
                                  PublicBy = q.PublicBy,
                                  ActivedDate = q.ActivedDate,
                                  ExpiredDate = q.ExpiredDate,
                                  SignedBy = q.SignedBy,
                                  Document = q.Document,
                                  Description = q.Description,
                                  Content = q.Content,
                                  Status = q.Status,
                                  LoaiHeThong = q.LoaiHeThong,
                                  LoaiHeThongName = nh != null && dl != null ? dl.Name : q.LoaiHeThong,
                                  CreatedDate = q.CreatedDate,
                                  UpdatedDate = q.UpdatedDate,
                                  CreatedBy = q.CreatedBy,
                                  UpdatedBy = q.UpdatedBy
                              }).FirstOrDefaultAsync() ?? throw new Exception("Không tìm thấy văn bản pháp lý");

            item.StatusName = GetStatusName(item.Status);

            // Fetch attachments associated with this ItemId
            var dinhKem = await _taiLieuDinhKemService.GetQueryable()
                .Where(x => x.ItemId == id)
                .Select(x => new TaiLieuDinhKemDto
                {
                    Id = x.Id,
                    TenTaiLieu = x.TenTaiLieu,
                    DuongDanFile = x.DuongDanFile,
                    Extension = x.Extension,
                    KichThuoc = x.KichThuoc,
                    LoaiTaiLieu = x.LoaiTaiLieu,
                    CreatedDate = x.CreatedDate,
                }).ToListAsync();

            item.DinhKem = dinhKem;

            return item;
        }

        public async Task<LegalDocument> Create(LegalDocumentCreateRequest request)
        {
            var entity = new LegalDocument
            {
                Id = (request.Id.HasValue && request.Id.Value != Guid.Empty) ? request.Id.Value : Guid.NewGuid(),
                LoaiVanBan = request.LoaiVanBan,
                Code = request.Code,
                PublicDate = request.PublicDate,
                PublicBy = request.PublicBy,
                ActivedDate = request.ActivedDate,
                ExpiredDate = request.ExpiredDate,
                SignedBy = request.SignedBy,
                Document = request.Document,
                Description = request.Description,
                Content = request.Content,
                Status = request.Status ?? "Draft",
                LoaiHeThong = request.LoaiHeThong
            };

            await CreateAsync(entity);
            return entity;
        }

        public async Task<LegalDocument> Update(LegalDocumentCreateRequest request)
        {
            if (!request.Id.HasValue || request.Id.Value == Guid.Empty)
            {
                throw new ArgumentException("Id bắt buộc để cập nhật bản ghi");
            }

            var entity = await GetByIdOrThrowAsync(request.Id.Value);
            entity.LoaiVanBan = request.LoaiVanBan;
            entity.Code = request.Code;
            entity.PublicDate = request.PublicDate;
            entity.PublicBy = request.PublicBy;
            entity.ActivedDate = request.ActivedDate;
            entity.ExpiredDate = request.ExpiredDate;
            entity.SignedBy = request.SignedBy;
            entity.Document = request.Document ?? entity.Document;
            entity.Description = request.Description;
            entity.Content = request.Content;
            entity.Status = request.Status;
            entity.LoaiHeThong = request.LoaiHeThong;

            await UpdateAsync(entity);
            return entity;
        }

        public async Task UpdateStatus(Guid id, string status)
        {
            var entity = await GetByIdOrThrowAsync(id);
            if (!IsValidTransition(entity.Status, status))
            {
                throw new Exception($"Không thể chuyển trạng thái văn bản {entity.Code} từ '{GetStatusName(entity.Status)}' sang '{GetStatusName(status)}'");
            }
            entity.Status = status;
            await UpdateAsync(entity);
        }

        public async Task UpdateStatusMultiple(List<Guid> ids, string status)
        {
            var entities = await GetQueryable().Where(x => ids.Contains(x.Id)).ToListAsync();
            foreach (var entity in entities)
            {
                if (!IsValidTransition(entity.Status, status))
                {
                    throw new Exception($"Không thể chuyển trạng thái văn bản {entity.Code} từ '{GetStatusName(entity.Status)}' sang '{GetStatusName(status)}'");
                }
                entity.Status = status;
            }
            await UpdateAsync(entities);
        }

        private static bool IsValidTransition(string? currentStatus, string targetStatus)
        {
            if (string.IsNullOrEmpty(currentStatus)) currentStatus = "Draft";
            if (currentStatus == targetStatus) return true;
            if (currentStatus == "Draft") return targetStatus == "Approved";
            if (currentStatus == "Approved") return targetStatus == "Removed";
            if (currentStatus == "Removed") return targetStatus == "Draft";
            return false;
        }

        private static IQueryable<LegalDocumentDto> ApplyFilter(IQueryable<LegalDocumentDto> query, LegalDocumentSearch? search)
        {
            if (search == null) return query;

            if (!string.IsNullOrWhiteSpace(search.Keyword))
            {
                var k = search.Keyword.Trim().ToUpper();
                query = query.Where(x =>
                    (x.Code != null && x.Code.ToUpper().Contains(k)) ||
                    (x.PublicBy != null && x.PublicBy.ToUpper().Contains(k)) ||
                    (x.SignedBy != null && x.SignedBy.ToUpper().Contains(k)) ||
                    (x.Description != null && x.Description.ToUpper().Contains(k)) ||
                    (x.Content != null && x.Content.ToUpper().Contains(k)));
            }

            if (!string.IsNullOrWhiteSpace(search.Code))
                query = query.Where(x => x.Code != null && x.Code.ToUpper().Contains(search.Code.Trim().ToUpper()));

            if (!string.IsNullOrWhiteSpace(search.LoaiVanBan))
                query = query.Where(x => x.LoaiVanBan == search.LoaiVanBan);

            if (!string.IsNullOrWhiteSpace(search.Status))
                query = query.Where(x => x.Status == search.Status);

            if (!string.IsNullOrWhiteSpace(search.LoaiHeThong))
                query = query.Where(x => x.LoaiHeThong == search.LoaiHeThong);

            if (search.TuNgay.HasValue)
                query = query.Where(x => x.PublicDate >= search.TuNgay.Value);

            if (search.DenNgay.HasValue)
                query = query.Where(x => x.PublicDate <= search.DenNgay.Value);

            if (!string.IsNullOrWhiteSpace(search.PublicBy))
                query = query.Where(x => x.PublicBy != null && x.PublicBy.ToUpper().Contains(search.PublicBy.Trim().ToUpper()));

            if (!string.IsNullOrWhiteSpace(search.SignedBy))
                query = query.Where(x => x.SignedBy != null && x.SignedBy.ToUpper().Contains(search.SignedBy.Trim().ToUpper()));

            if (search.ActivedDateFrom.HasValue)
                query = query.Where(x => x.ActivedDate >= search.ActivedDateFrom.Value);

            if (search.ActivedDateTo.HasValue)
                query = query.Where(x => x.ActivedDate <= search.ActivedDateTo.Value);

            if (search.ExpiredDateFrom.HasValue)
                query = query.Where(x => x.ExpiredDate >= search.ExpiredDateFrom.Value);

            if (search.ExpiredDateTo.HasValue)
                query = query.Where(x => x.ExpiredDate <= search.ExpiredDateTo.Value);

            if (!string.IsNullOrWhiteSpace(search.Description))
                query = query.Where(x => x.Description != null && x.Description.ToUpper().Contains(search.Description.Trim().ToUpper()));

            return query;
        }

        private static string GetStatusName(string? status)
        {
            return status switch
            {
                "Draft" => "Bản nháp",
                "Approved" => "Đã duyệt",
                "Removed" => "Gỡ bỏ",
                _ => status ?? "Bản nháp"
            };
        }
    }
}
