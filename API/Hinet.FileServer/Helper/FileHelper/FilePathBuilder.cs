using System.Text.RegularExpressions;
using Hinet.FileServer.Configuration;

namespace Hinet.FileServer.Helper.FileHelper
{
    // Sinh đường dẫn lưu file theo spec tài liệu "Hệ thống online.docx" (mục Tài liệu đính kèm).
    // Pattern: /uploads/{category}/{yyyy}/{MM}/{dd}/{taxCode}/{subCategory}/{itemId}/{storedFileName}
    //
    // Mỗi category áp dụng 1 rule riêng — xem switch trong Build().
    public static class FilePathBuilder
    {
        // Chấp nhận MST 10-13 chữ số (và MST cá nhân 10 số) hoặc UUID/hỗn hợp tối đa 20 ký tự alnum
        private static readonly Regex TaxCodeRegex = new(@"^[A-Za-z0-9\-]{6,20}$", RegexOptions.Compiled);
        // Filename an toàn: bỏ ký tự / \ : * ? " < > |  + cắt control chars
        private static readonly Regex UnsafeFileChars = new(@"[\/\\:\*\?""<>\|\x00-\x1f]", RegexOptions.Compiled);

        public class UploadContext
        {
            public string Category { get; set; } = FileCategoryConstant.General;
            public string? SubCategory { get; set; }
            public string? TaxCode { get; set; }
            public Guid? ItemId { get; set; }
            public DateTime UploadedAt { get; set; } = DateTime.Now;
        }

        // Sinh phần thư mục tương đối (chưa kèm filename).
        // VD: "platform/2026/05/20/0100123456/NTThongBaoKD/aaaa-bbbb-cccc"
        public static string BuildDirectory(UploadContext ctx)
        {
            ValidateContext(ctx);

            var date = ctx.UploadedAt.ToString("yyyy/MM/dd");
            var tc = SanitizeSegment(ctx.TaxCode);
            var sub = SanitizeSegment(ctx.SubCategory);
            var id = ctx.ItemId?.ToString();

            return ctx.Category switch
            {
                // Spec: /upload/năm/tháng/ngày/MST chủ quản/PlatformManageType/Id Nền tảng
                FileCategoryConstant.Platform =>
                    Combine(FileCategoryConstant.Platform, date, tc!, sub!, id!),

                // Spec: /upload/năm/tháng/ngày/MST chủ quản/AuthenticationContract/Id
                FileCategoryConstant.Contract =>
                    Combine(FileCategoryConstant.Contract, date, tc!, "AuthenticationContract", id!),

                // Mở rộng: tài liệu chung của DN (ĐKKD, uỷ quyền) — không cần ItemId
                FileCategoryConstant.Company =>
                    Combine(FileCategoryConstant.Company, date, tc!, sub ?? "Other"),

                // Avatar user — ItemId = userId
                FileCategoryConstant.Avatar =>
                    Combine(FileCategoryConstant.Avatar, date, id!),

                FileCategoryConstant.RutTienKyQuy =>
                    Combine(date, tc!, "RutTienKyQuy", id!),

                FileCategoryConstant.PhanAnhNenTang =>
                    Combine(FileCategoryConstant.PhanAnhNenTang, date, id!),

                // Fallback
                _ => Combine(FileCategoryConstant.General, date),
            };
        }

        // Sinh tên file lưu trên disk (an toàn). Format: {guid}_{cleanedName}
        public static string BuildStoredFileName(Guid id, string originalName)
        {
            if (string.IsNullOrWhiteSpace(originalName))
                originalName = "file";
            var safe = UnsafeFileChars.Replace(Path.GetFileName(originalName), "_");
            return $"{id}_{safe}";
        }

        // === Validation ===

        private static void ValidateContext(UploadContext ctx)
        {
            if (!FileCategoryConstant.IsValidCategory(ctx.Category))
                throw new ArgumentException($"Category không hợp lệ: '{ctx.Category}'. Hợp lệ: {string.Join(", ", FileCategoryConstant.All)}");

            // Yêu cầu trường nào tuỳ category
            switch (ctx.Category)
            {
                case FileCategoryConstant.Platform:
                    Require(ctx.TaxCode,    nameof(ctx.TaxCode),    validate: IsValidTaxCode);
                    Require(ctx.SubCategory, nameof(ctx.SubCategory),
                        validate: s => FileCategoryConstant.IsValidSubCategory(ctx.Category, s));
                    if (ctx.ItemId == null || ctx.ItemId == Guid.Empty)
                        throw new ArgumentException("ItemId (Id nền tảng) là bắt buộc cho category 'platform'");
                    break;

                case FileCategoryConstant.Contract:
                    Require(ctx.TaxCode, nameof(ctx.TaxCode), validate: IsValidTaxCode);
                    if (ctx.ItemId == null || ctx.ItemId == Guid.Empty)
                        throw new ArgumentException("ItemId (Id hợp đồng) là bắt buộc cho category 'contract'");
                    break;

                case FileCategoryConstant.Company:
                    Require(ctx.TaxCode, nameof(ctx.TaxCode), validate: IsValidTaxCode);
                    if (!FileCategoryConstant.IsValidSubCategory(ctx.Category, ctx.SubCategory))
                        throw new ArgumentException($"SubCategory '{ctx.SubCategory}' không hợp lệ cho category 'company'");
                    break;

                case FileCategoryConstant.Avatar:
                    if (ctx.ItemId == null || ctx.ItemId == Guid.Empty)
                        throw new ArgumentException("ItemId (userId) là bắt buộc cho category 'avatar'");
                    break;

                case FileCategoryConstant.RutTienKyQuy:
                    Require(ctx.TaxCode, nameof(ctx.TaxCode), validate: IsValidTaxCode);
                    if (ctx.ItemId == null || ctx.ItemId == Guid.Empty)
                        throw new ArgumentException("ItemId (Id nền tảng) là bắt buộc cho category 'RutTienKyQuy'");
                    break;

                case FileCategoryConstant.PhanAnhNenTang:
                    if (ctx.ItemId == null || ctx.ItemId == Guid.Empty)
                        throw new ArgumentException("ItemId là bắt buộc cho category 'PhanAnhNenTang'");
                    break;

                case FileCategoryConstant.General:
                    // no extra checks
                    break;
            }
        }

        private static bool IsValidTaxCode(string? v) =>
            !string.IsNullOrWhiteSpace(v) && TaxCodeRegex.IsMatch(v);

        private static void Require(string? value, string fieldName, Func<string?, bool>? validate = null)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException($"{fieldName} là bắt buộc");
            if (validate != null && !validate(value))
                throw new ArgumentException($"{fieldName} không đúng định dạng: '{value}'");
        }

        // Chỉ cho A-Z a-z 0-9 - _ . để tránh path traversal qua segment.
        private static string? SanitizeSegment(string? s) =>
            string.IsNullOrWhiteSpace(s) ? null : Regex.Replace(s, @"[^A-Za-z0-9\-_\.]", "_");

        private static string Combine(params string[] segments) =>
            string.Join('/', segments.Where(x => !string.IsNullOrWhiteSpace(x)));
    }
}
