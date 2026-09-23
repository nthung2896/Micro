using Hinet.Model.Entities;
using Microsoft.AspNetCore.Http;

namespace Hinet.Service.TaiLieuPreviewService
{
    public interface ITaiLieuPreviewService
    {
        Task<(Stream Stream, string FileName, string ContentType)> OpenPreviewAsync(Guid attachmentId, CancellationToken cancellationToken);
        Task<(Stream Stream, string FileName, string ContentType)> OpenDownloadAsync(Guid attachmentId, CancellationToken cancellationToken);
        Task<(byte[] Content, string FileName, string ContentType)> PreviewTemporaryAsync(IFormFile file, CancellationToken cancellationToken);
    }
}
