using Hinet.FileServer.Configuration;

namespace Hinet.FileServer.Request
{
    public class UploadFileBase64Request
    {
        public List<UploadBase64FileItem>? Files { get; set; }

        public string Category { get; set; } = FileCategoryConstant.General;
        public string? SubCategory { get; set; }
        public string? TaxCode { get; set; }
        public Guid? ItemId { get; set; }
        public string? LoaiTaiLieu { get; set; }

        public string? SerialNumber { get; set; }
        public bool RequiredKySo { get; set; } = false;
        public bool IncludeExportInfo { get; set; } = false;

        // Backward compat
        public string? FileType { get; set; }
    }

    public class UploadBase64FileItem
    {
        public string FileName { get; set; } = "";
        public string Base64 { get; set; } = "";
    }
}
