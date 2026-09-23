using System.Collections.Concurrent;

namespace Hinet.Service.TaiLieuPreviewService
{
    public sealed class PreviewConversionCoordinator
    {
        private readonly SemaphoreSlim _globalSemaphore;
        private readonly ConcurrentDictionary<Guid, SemaphoreSlim> _attachmentLocks = new();

        public PreviewConversionCoordinator(int maxConcurrentConversions)
        {
            _globalSemaphore = new SemaphoreSlim(Math.Max(1, maxConcurrentConversions));
        }

        public SemaphoreSlim GetAttachmentLock(Guid attachmentId) =>
            _attachmentLocks.GetOrAdd(attachmentId, _ => new SemaphoreSlim(1, 1));

        public Task WaitForConversionSlotAsync(CancellationToken cancellationToken) =>
            _globalSemaphore.WaitAsync(cancellationToken);

        public void ReleaseConversionSlot() => _globalSemaphore.Release();
    }
}
