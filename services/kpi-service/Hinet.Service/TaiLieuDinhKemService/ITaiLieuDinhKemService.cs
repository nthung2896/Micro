using Hinet.Model.Entities;
using Hinet.Service.TaiLieuDinhKemService.Dto;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.TaiLieuDinhKemService.Request;

namespace Hinet.Service.TaiLieuDinhKemService
{
    public interface ITaiLieuDinhKemService : IService<TaiLieuDinhKem>
    {
        Task<List<TaiLieuDinhKem>> GetByItemAsync(Guid itemId);
        Task<PagedList<TaiLieuDinhKemDto>> GetData(TaiLieuDinhKemSearch search);

        Task<List<TaiLieuDinhKem>> GetByIdsAsync(List<Guid> ids);
        Task<TaiLieuDinhKem> UpdateItemIdAsync(Guid itemId, Guid id);
        Task<List<TaiLieuDinhKem>> UpdateItemIdAsync(Guid itemId, List<Guid> ids);
        Task<string> GetPathFromId(Guid id);
        Task<Stream?> GetStreamAsync(Guid? fileId);
        Task DeleteAsync(List<Guid> guids, Guid? userId);
        Task<Guid> UploadAsync(Stream fileStream, string? fileName, string? fileType, Guid? itemId);
        Task<List<TaiLieuDinhKem>> GetByItemId(Guid itemId, string? type = null);
        Task<TaiLieuDinhKem?> GetById(Guid id);

        Task<Guid> UploadImage(Stream stream, string? fileName, string? fileType, Guid? itemId, Guid userId);
        Task<string> UploadDocumentAsync(Stream stream, string fileName, string folderType = "files");
        Task<List<DanhSachTaiLieuDto>> GetDanhSachTaiLieu(string? keyword, string? loaiTaiLieu);
        Task<TaiLieuDinhKem> UploadAndSaveDb(Stream stream, string fileName, string tenTaiLieuText, string folderType, Guid? itemId, Guid? userId);
        Task<TaiLieuDinhKem> UploadAndCreateKpiAttachmentAsync(Stream stream, string fileName, Guid itemId, Guid? userId);
        void DeletePhysicalFile(string relativePath);
        Task<(bool IsSuccess, string Message, FileInfoResponseDto? Data)> GetFileInfo(Guid id);
    }
}
