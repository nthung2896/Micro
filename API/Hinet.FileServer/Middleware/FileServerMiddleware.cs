using Hinet.FileServer.Helper.FileHelper;
using Hinet.FileServer.Services.TaiLieuDinhKemService;
using System.Linq;

namespace Hinet.FileServer.Middleware
{
    public class FileServerMiddleware
    {
        private readonly RequestDelegate _next;

        // Folder/file con dưới /uploads/* được phép truy cập trực tiếp qua GET (file public,
        // không cần bảo mật). Kiểm tra nếu BẤT KỲ segment nào trong path chứa tên public
        // (không chỉ segment đầu) thì cho qua → UseStaticFiles serve.
        // VD: /uploads/2026/01/31/.../RegisterWebsite/... → cho qua.
        //     /uploads/tin-tuc/... → cho qua.
        private static readonly HashSet<string> PublicCategories =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "tin-tuc",
                "gioi-thieu",
                "bieu-mau",
                "van-ban-phap-luat",
                "home-block",
                "platform-logo",
                "banner",
                "resources",
                "registerwebsite",
                "notifywebsite",
                "registerapp",
                "notifyapp",
            };

        public FileServerMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {

            if (context.Request.Method == "GET"
                && context.Request.Path.StartsWithSegments("/uploads", out var uploadsRem))
            {
                var segments = uploadsRem.Value?.Trim('/').Split('/') ?? Array.Empty<string>();
                if (segments.Any(s => PublicCategories.Contains(s)))
                {
                    await _next(context);
                    return;
                }
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return;
            }

            if (context.Request.Method == "GET" &&
                context.Request.Path.StartsWithSegments("/fileserver", out var remaining) && remaining.HasValue)
            {
                // Extract: /fileserver/{id}/{filename}
                var segments = remaining.Value.Trim('/').Split('/');
                if (segments.Length >= 1)
                {
                    if (Guid.TryParse(segments[0], out var id))
                    {
                        var taiLieuDinhKemService = context.RequestServices.GetRequiredService<ITaiLieuDinhKemService>();
                        var tailieu = await taiLieuDinhKemService.GetById(id);

                        if (tailieu != null && !string.IsNullOrEmpty(tailieu.DuongDanFile))
                        {
                            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                            string? relPath = ResolveRelativePath(tailieu.DuongDanFile, uploadsRoot, id);
                            if (relPath != null)
                            {
                                context.Request.Path = $"/uploads/{relPath.Replace('\\', '/')}";
                                await _next(context);
                                return;
                            }
                        }
                        context.Response.StatusCode = StatusCodes.Status404NotFound;
                        await context.Response.WriteAsync("File not found");
                        return;
                    }
                }
            }

            await _next(context);
        }

        // Resolve relative path từ giá trị DuongDanFile lưu trong DB.
        // 3 trường hợp:
        //   (a) Relative path hợp lệ (vd. "general/2026/05/25/{id}_file.pdf") → dùng trực tiếp.
        //   (b) URL full (chứa "://") — dữ liệu cũ trước khi sửa flow lưu →
        //       fallback search trong uploadsRoot theo prefix "{id}_*".
        //   (c) Path invalid (path traversal) → trả null.
        private static string? ResolveRelativePath(string dbValue, string uploadsRoot, Guid id)
        {
             // Nếu đã có Uploads/ thì bỏ đi
            if (dbValue.StartsWith("Uploads/", StringComparison.OrdinalIgnoreCase))
            {
                dbValue = dbValue["Uploads/".Length..];
            }
            dbValue = dbValue.Replace("\\", "/");
            // (a) thử relative path trước
            if (!dbValue.Contains("://"))
            {
                try
                {
                    var fullPath = SafePath.CombineSafe(uploadsRoot, dbValue);
                    if (File.Exists(fullPath)) return dbValue;
                }
                catch (PathTraversalException) { /* rơi xuống (b) */ }
            }

            // (b) glob search theo "{id}_*"
            try
            {
                var match = Directory.EnumerateFiles(uploadsRoot, $"{id}_*", SearchOption.AllDirectories).FirstOrDefault();
                if (match != null)
                {
                    return Path.GetRelativePath(uploadsRoot, match);
                }
            }
            catch { /* uploadsRoot không tồn tại */ }

            return null;
        }

        private string GetContentType(string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".ppt" => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".webp" => "image/webp",
                ".txt" => "text/plain",
                ".csv" => "text/csv",
                _ => "application/octet-stream"
            };
        }
    }
}
