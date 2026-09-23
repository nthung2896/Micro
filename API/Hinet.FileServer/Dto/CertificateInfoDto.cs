namespace Hinet.FileServer.Dto
{
    public class CertificateInfoDto
    {
        public string? Cn { get; set; }
        public string? Issuer { get; set; }
        public string? SerialNumber { get; set; }
        public DateTime SignedAt { get; set; }
        public bool IsValid { get; set; }            // Chữ ký hợp lệ?
        public bool IsExpired { get; set; }          // Cert hết hạn?
        public bool DocumentModified { get; set; }   // File bị chỉnh sửa?
    }
}
