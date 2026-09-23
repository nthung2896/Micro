using DocumentFormat.OpenXml.Packaging;
using HtmlAgilityPack;
using Mammoth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml.Linq;
namespace Hinet.Service.Common
{
    public static class DocumentContentExtractor
    {
        /// <summary>
        /// Extract content từ file Word (.docx) và convert sang HTML sử dụng OpenXmlPowerTools
        /// Hỗ trợ cả file Local và file từ URL (HTTP/HTTPS)
        /// </summary>
        public static string? ExtractContent(string relativePath, string? apiBaseUrl = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(relativePath))
                    return "<p>Đường dẫn file không được để trống.</p>";

                // Khởi tạo tên file tạm
                var tempFilePath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.docx");

                // 1. PHÂN LOẠI ĐƯỜNG DẪN LÀ URL HAY LOCAL
                bool isUrl = relativePath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                             relativePath.StartsWith("https://", StringComparison.OrdinalIgnoreCase);


                // Xử lý lấy file
                try
                {
                    if (isUrl)
                    {
                        using (var client = new HttpClient())
                        {
                            // Sử dụng .GetAwaiter().GetResult() để chạy đồng bộ do hàm ExtractContent không phải là async
                            var fileBytes = client.GetByteArrayAsync(relativePath).GetAwaiter().GetResult();
                            File.WriteAllBytes(tempFilePath, fileBytes);
                        }
                    }
                    else
                    {
                        // File cục bộ trên server
                        var localFilePath = Path.Combine("wwwroot/uploads", relativePath);
                        if (!File.Exists(localFilePath))
                        {
                            // Đề phòng trường hợp relativePath đã chứa "wwwroot/uploads" sẵn
                            localFilePath = Path.Combine(Directory.GetCurrentDirectory(), relativePath);
                            if (!File.Exists(localFilePath))
                            {
                                return $"<p>Không tìm thấy file vật lý trên server: {relativePath}</p>";
                            }
                        }
                        File.Copy(localFilePath, tempFilePath, true);
                    }
                }
                catch (Exception ex)
                {
                    return $"<p>Lỗi khi đọc file đính kèm: {ex.Message}</p>";
                }



                // 2. XỬ LÝ ĐỌC FILE 
                try
                {
                    string? backgroundUrl = null;

                    // 2. LẤY ẢNH NỀN (DÙNG OPENXML LÕI - KHÔNG GÂY LỖI WINDOWS.FORMS)
                    using (WordprocessingDocument wordDoc = WordprocessingDocument.Open(tempFilePath, false))
                    {
                        var headerParts = wordDoc.MainDocumentPart?.HeaderParts;
                        if (headerParts != null)
                        {
                            foreach (var header in headerParts)
                            {
                                foreach (var img in header.ImageParts)
                                {
                                    using (var stream = img.GetStream())
                                    using (var ms = new MemoryStream())
                                    {
                                        stream.CopyTo(ms);
                                        var bytes = ms.ToArray();
                                        var extensionImg = img.ContentType switch
                                        {
                                            "image/png" => ".png",
                                            "image/jpeg" => ".jpg",
                                            "image/jpg" => ".jpg",
                                            _ => ".png"
                                        };

                                        var fileName = $"{Guid.NewGuid()}{extensionImg}";
                                        var folderPath = Path.Combine("wwwroot", "uploads", "backgrounds");
                                        if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                                        var filePath = Path.Combine(folderPath, fileName);
                                        File.WriteAllBytes(filePath, bytes);
                                        backgroundUrl = $"/uploads/backgrounds/{fileName}";
                                        break; // Chỉ lấy ảnh đầu tiên
                                    }
                                }
                                if (backgroundUrl != null) break;
                            }
                        }
                    }

                    // 3. CONVERT SANG HTML (DÙNG MAMMOTH)
                    var converter = new DocumentConverter();
                    var result = converter.ConvertToHtml(tempFilePath);
                    string htmlContent = result.Value; // HTML gốc từ biểu mẫu (rất sạch)

                    // 4. BỌC GIAO DIỆN A4 VÀ CSS
                    var finalHtml = new System.Text.StringBuilder();

                    // Nạp CSS
                    // Thay đoạn CSS cũ bằng đoạn này:
                    finalHtml.AppendLine(@"<style>
                        /* Reset cơ bản */
                        .docx-page-wrapper { box-sizing: border-box; overflow-wrap: break-word; word-wrap: break-word; font-family: 'Times New Roman', serif; font-size: 14pt;}
                        .docx-page-wrapper * { box-sizing: border-box; }
                        
                        /* Chống tràn ảnh */
                        .docx-page-wrapper img { max-width: 100% !important; height: auto !important; }
                        
                        /* Cấu hình chung cho mọi bảng */
                        .docx-page-wrapper table { max-width: 100% !important; width: 100% !important; border-collapse: collapse; }
                        .docx-page-wrapper td, .docx-page-wrapper th { padding: 5px; vertical-align: top; }
                        
                        /* HIỆU ỨNG THÔNG MINH CHO BẢNG DỮ LIỆU (Nhiều dòng) */
                        .docx-page-wrapper table.data-table { border: 1px solid black; }
                        .docx-page-wrapper table.data-table td, .docx-page-wrapper table.data-table th { border: 1px solid black; }
                        
                        /* HIỆU ỨNG CHO BẢNG BỐ CỤC (Ít dòng - Ẩn viền) */
                        .docx-page-wrapper table.layout-table td { border: none !important; }
                        
                        /* Cuộn ngang nếu bảng to */
                        .table-responsive { width: 100%; overflow-x: auto; display: block; margin-bottom: 15px; }
                        </style>");

                    // Nạp Wrapper chứa ảnh nền
                    string backgroundStyle = "";
                    if (!string.IsNullOrEmpty(backgroundUrl))
                    {
                        var backgroundImageUrl = BuildAbsoluteUrl(apiBaseUrl, backgroundUrl);
                        backgroundStyle = $"background-image: url('{backgroundImageUrl}'); background-size: 100% 297mm; background-repeat: repeat-y; background-position: top center;";
                    }

                    finalHtml.AppendLine($@"<div class=""docx-page-wrapper"" style=""position: relative; width: 100%; max-width: 210mm; min-height: 297mm; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 2cm; background-color: white; {backgroundStyle}"">");

                    // Bọc các thẻ table vào div responsive để có thanh cuộn ngang
                    htmlContent = Regex.Replace(htmlContent, "(<table.*?>.*?</table>)", "<div class=\"table-responsive\">$1</div>", RegexOptions.Singleline | RegexOptions.IgnoreCase);

                    finalHtml.AppendLine(htmlContent);
                    finalHtml.AppendLine("</div>");

                    string finalString = finalHtml.ToString();

                    // 5. CLEAN TRASH TEXT BẰNG HtmlAgilityPack (Dọn rác ẩn trong Word)
                    var htmlDoc = new HtmlDocument();
                    htmlDoc.LoadHtml(finalString);
                    var trashTexts = new[] { "&lrm;", "\u200E", "\u200F", "&rlm;", "\"&lrm;\"", "'&lrm;'", "&#x200e;", "&#8206;", "&#x200f;", "&#8207;" };
                    var textNodes = htmlDoc.DocumentNode.SelectNodes("//text()");
                    if (textNodes != null)
                    {
                        foreach (var node in textNodes)
                        {
                            var text = node.InnerText;
                            foreach (var trash in trashTexts)
                            {
                                text = text.Replace(trash, "").Replace(((char)8206).ToString(), "").Replace(((char)8207).ToString(), "");
                            }
                            if (string.IsNullOrWhiteSpace(text)) node.ParentNode.RemoveChild(node);
                            else if (text != node.InnerText) node.InnerHtml = text;
                        }
                    }
                    var tableNodes = htmlDoc.DocumentNode.SelectNodes("//table");
                    if (tableNodes != null)
                    {
                        foreach (var table in tableNodes)
                        {
                            // Đếm số dòng (tr) trong bảng này
                            var rows = table.SelectNodes(".//tr");
                            int rowCount = rows != null ? rows.Count : 0;

                            // Nếu bảng có từ 3 dòng trở lên -> Gán mác là bảng dữ liệu (sẽ được vẽ viền đen)
                            if (rowCount > 2)
                            {
                                table.SetAttributeValue("class", "data-table");
                            }
                            else
                            {
                                // Nếu bảng chỉ có 1-2 dòng -> Đây là bảng dàn layout, gán mác ẩn viền
                                table.SetAttributeValue("class", "layout-table");
                            }
                        }
                    }
                    return htmlDoc.DocumentNode.OuterHtml;
                }
                finally
                {
                    if (File.Exists(tempFilePath))
                    {
                        try { File.Delete(tempFilePath); } catch { }
                    }
                }
            }
            catch (Exception ex)
            {
                return $"<p>Lỗi xử lý file Word: {ex.Message}</p>";
            }

        }

        /// <summary>
        /// Extract tất cả field keys từ htmlContent (pattern: [[key]])
        /// </summary>
        public static List<string> ExtractFieldKeys(string? htmlContent)
        {
            if (string.IsNullOrEmpty(htmlContent))
                return new List<string>();

            try
            {
                var pattern = @"\[\[([^\]]+)\]\]";
                var matches = Regex.Matches(htmlContent, pattern);

                var keys = matches
                    .Cast<Match>()
                    .Select(m => m.Groups[1].Value.Trim())
                    .Where(k => !string.IsNullOrWhiteSpace(k))
                    .Distinct()
                    .ToList();

                return keys;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error extracting field keys: {ex.Message}");
                return new List<string>();
            }
        }

        private static string BuildAbsoluteUrl(string? apiBaseUrl, string relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
                return string.Empty;

            if (relativePath.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
                || relativePath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                return relativePath;
            }

            if (string.IsNullOrWhiteSpace(apiBaseUrl))
                return relativePath;

            var baseUrl = apiBaseUrl.TrimEnd('/');
            var relPath = relativePath.StartsWith("/") ? relativePath : $"/{relativePath}";
            return $"{baseUrl}{relPath}";
        }
    }
}
