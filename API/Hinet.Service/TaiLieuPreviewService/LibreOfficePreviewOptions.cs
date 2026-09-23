namespace Hinet.Service.TaiLieuPreviewService
{
    public sealed class LibreOfficePreviewOptions
    {
        public string ExecutablePath { get; set; } = string.Empty;
        public int ConversionTimeoutSeconds { get; set; } = 60;
        public int MaxConcurrentConversions { get; set; } = 2;
        public string CacheDirectory { get; set; } = "wwwroot/preview-cache";
        public string TempDirectory { get; set; } = "preview-temp";
    }
}
