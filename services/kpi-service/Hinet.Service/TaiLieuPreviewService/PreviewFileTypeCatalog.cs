namespace Hinet.Service.TaiLieuPreviewService
{
    /// <summary>
    /// Danh sách định dạng tài liệu đính kèm được hệ thống cho phép lưu trữ và
    /// hỗ trợ xem trước. Các nơi upload và preview dùng chung danh sách này để
    /// tránh tình trạng frontend/backend cho phép không đồng nhất.
    /// </summary>
    public static class PreviewFileTypeCatalog
    {
        public static readonly IReadOnlySet<string> AllowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp",
            ".pdf",
            ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
            ".txt", ".csv",
        };

        public static readonly IReadOnlySet<string> OfficeExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
        };

        public static readonly IReadOnlySet<string> ImageExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp",
        };

        public static readonly IReadOnlySet<string> TextExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".txt", ".csv",
        };

        public static bool IsAllowed(string? extension) => AllowedExtensions.Contains(NormalizeExtension(extension, null));

        public static bool IsOffice(string? extension) => OfficeExtensions.Contains(NormalizeExtension(extension, null));

        public static bool IsImage(string? extension) => ImageExtensions.Contains(NormalizeExtension(extension, null));

        public static bool IsText(string? extension) => TextExtensions.Contains(NormalizeExtension(extension, null));

        public static string NormalizeExtension(string? extension, string? fileName)
        {
            var value = string.IsNullOrWhiteSpace(extension) ? Path.GetExtension(fileName ?? string.Empty) : extension;
            value = (value ?? string.Empty).Trim().TrimStart('.');
            return string.IsNullOrWhiteSpace(value) ? string.Empty : $".{value.ToLowerInvariant()}";
        }

        public static string GetContentType(string? extension)
        {
            return NormalizeExtension(extension, null) switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".webp" => "image/webp",
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".ppt" => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".csv" => "text/csv; charset=utf-8",
                ".txt" => "text/plain; charset=utf-8",
                _ => "application/octet-stream",
            };
        }
    }
}
