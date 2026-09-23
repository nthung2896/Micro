namespace Hinet.FileServer.Configuration
{
    // Phân loại tài liệu cấp 1 — bắt buộc client truyền 1 trong các giá trị này
    // khi upload. Mỗi category có rule sinh path riêng (xem FilePathBuilder).
    public static class FileCategoryConstant
    {
        public const string Platform = "platform";        // Tài liệu nền tảng TMĐT
        public const string Contract = "contract";        // Tài liệu chứng thực HĐĐT
        public const string Company  = "company";         // Tài liệu DN: ĐKKD, uỷ quyền...
        public const string Avatar   = "avatar";          // Ảnh đại diện user
        public const string General  = "general";         // Fallback
        public const string RutTienKyQuy = "RutTienKyQuy"; // Tài liệu Rút tiền ký quỹ
        public const string PhanAnhNenTang = "PhanAnhNenTang"; // Tài liệu Phản ánh nền tảng

        public static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
        {
            Platform, Contract, Company, Avatar, General, RutTienKyQuy, PhanAnhNenTang
        };

        // Whitelist SubCategory cho từng Category. Empty list = chấp nhận giá trị bất kỳ.
        public static readonly Dictionary<string, HashSet<string>> AllowedSubCategories =
            new(StringComparer.OrdinalIgnoreCase)
            {
                [Platform] = new(StringComparer.OrdinalIgnoreCase)
                {
                    "NTThongBaoKD",
                    "NTDangKyKDNuocNgoai",
                    "NTTichHop",
                    "NTTichHopNuocNgoai",
                },
                [Contract] = new(StringComparer.OrdinalIgnoreCase)
                {
                    "AuthenticationContract",
                },
                [Company]  = new(StringComparer.OrdinalIgnoreCase)
                {
                    "DKKD", "UyQuyen", "KhacDangKy",
                },
                [Avatar]   = new(StringComparer.OrdinalIgnoreCase) { /* free */ },
                [General]  = new(StringComparer.OrdinalIgnoreCase) { /* free */ },
                [RutTienKyQuy] = new(StringComparer.OrdinalIgnoreCase) { /* free */ },
                [PhanAnhNenTang] = new(StringComparer.OrdinalIgnoreCase) { /* free */ },
            };

        public static bool IsValidCategory(string? c) =>
            !string.IsNullOrWhiteSpace(c) && All.Contains(c);

        public static bool IsValidSubCategory(string category, string? sub)
        {
            if (string.IsNullOrWhiteSpace(category)) return false;
            if (!AllowedSubCategories.TryGetValue(category, out var whitelist)) return true;
            if (whitelist.Count == 0) return true; // category không yêu cầu sub
            return !string.IsNullOrWhiteSpace(sub) && whitelist.Contains(sub);
        }
    }
}
