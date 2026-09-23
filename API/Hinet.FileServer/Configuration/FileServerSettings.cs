namespace Hinet.FileServer.Configuration
{
    public class FileServerSettings
    {
        public string? BaseUrl { get; set; }
        public string? ClientBaseUrl { get; set; }
        public string? UploadRoot { get; set; }
        public int? MaxFileSizeMB { get; set; }
        public List<string>? AllowedExtensions { get; set; }
        public bool RequirePdfDigitalSignature { get; set; }
    }
}
