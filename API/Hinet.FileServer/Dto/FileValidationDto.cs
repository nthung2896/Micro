namespace Hinet.FileServer.Dto
{
    public class FileValidationDto
    {
        public bool IsValid { get; set; }
        public string? FileType { get; set; }
        public long SizeKB { get; set; }
        public bool IsRealExtension { get; set; }        // header đúng?
        public bool IsNotCorrupted { get; set; }         // file không hỏng?
        public bool IsSignedPdf { get; set; }            // có chữ ký PDF?
        public bool PdfSignatureValid { get; set; }
        public bool PdfNotTampered { get; set; }
        public bool ImageEdited { get; set; }            // ảnh photoshop?
        public bool ContainsMalware { get; set; }        // optional
        public string? Message { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<CertificateInfoDto> PdfCertificates { get; set; } = new();
        public bool ContainsMacro { get; set; }
        public bool ContainsPdfJavaScript { get; set; }
    }
}
