using Hinet.Service.IGateSyncService.Dto;

namespace Hinet.Service.IGateSyncService
{
    public interface IIGateSyncService
    {
        Task<string?> GetConnectorTokenAsync();
        Task<List<IGateDossierItem>?> SyncNewDossiersAsync(string? maTthc = null);
        Task<bool> ConfirmDossierReceivedAsync(string maHoSo, int trangThaiNhan = 1);
        Task<string?> UploadAttachmentAsync(string maHoSo, string fileName, Stream fileStream);
        Task<Stream?> DownloadAttachmentAsync(string fileId, string maHoSo);
        Task<bool> UpdateProcessProgressAsync(List<DossierProgressDto> progresses);
        Task<bool> UpdateDossierStatusAsync(string maHoSo, int trangThai);
    }
}
