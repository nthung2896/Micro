namespace Hinet.FileServer.Helper.FileHelper
{
    // Guard chống path traversal: ép mọi resolved path phải nằm trong root cho phép.
    // Bất kỳ giá trị nào chứa "..", absolute path, ký tự null, hay rooted Windows segment
    // mà thoát ra ngoài root đều bị reject -> ném PathTraversalException.
    public static class SafePath
    {
        // root: absolute path (vd: "E:/Hinet/.../wwwroot/uploads")
        // relative: giá trị từ DB / user input (vd: "files/20260519/abc.pdf")
        // → trả về absolute path đã chuẩn hoá, đảm bảo nằm trong root.
        public static string CombineSafe(string root, string? relative)
        {
            if (string.IsNullOrWhiteSpace(relative))
                throw new PathTraversalException("Đường dẫn rỗng");

            // Block ký tự null (Linux null-byte injection)
            if (relative.IndexOf('\0') >= 0)
                throw new PathTraversalException("Đường dẫn chứa ký tự null");

            // Block absolute / rooted path để chặn input kiểu "/etc/passwd" hoặc "C:\Windows\..."
            if (Path.IsPathRooted(relative))
                throw new PathTraversalException("Không cho phép đường dẫn tuyệt đối");

            var rootFull = Path.GetFullPath(root)
                               .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
            var combinedFull = Path.GetFullPath(Path.Combine(rootFull, relative));

            // So sánh prefix: combined phải bắt đầu bằng root + separator
            var sep = Path.DirectorySeparatorChar;
            if (!combinedFull.StartsWith(rootFull + sep, StringComparison.OrdinalIgnoreCase)
                && !string.Equals(combinedFull, rootFull, StringComparison.OrdinalIgnoreCase))
            {
                throw new PathTraversalException($"Đường dẫn thoát ra ngoài root: {relative}");
            }

            return combinedFull;
        }

        // Validate-only: chỉ check, không trả full path. Dùng khi cần kiểm tra trước khi build URL.
        public static bool IsSafe(string root, string? relative)
        {
            try { CombineSafe(root, relative); return true; }
            catch (PathTraversalException) { return false; }
        }
    }

    public class PathTraversalException : Exception
    {
        public PathTraversalException(string message) : base(message) { }
    }
}
