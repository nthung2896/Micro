using Hinet.FileServer.Helper.HCHelper;
using Hinet.FileServer.Helper.Pdf;
using iText.Signatures;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.security;
using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;



namespace Hinet.FileServer.Helper.FileHelper
{
    public static class FileHelper
    {
        public static FileValidationResult ValidateFile(string path)
        {
            var result = new FileValidationResult();
            try
            {
                if (!File.Exists(path))
                {
                    result.IsValid = false;
                    result.Errors.Add("File không tồn tại.");
                    return result;
                }

                result.SizeKB = new FileInfo(path).Length / 1024;

                // 1. Check extension + magic number
                if (!CheckMagicNumber(path, out string realType))
                {
                    result.IsRealExtension = false;
                    result.Errors.Add("File không đúng định dạng thực.");
                }
                else
                {
                    result.IsRealExtension = true;
                    result.FileType = realType;
                }

                // 2. Check corrupted
                result.IsNotCorrupted = CheckNotCorrupted(path, realType);
                if (!result.IsNotCorrupted)
                {
                    result.Errors.Add("File bị hỏng hoặc không thể đọc.");
                }

                // 3. Kiểm tra PDF SIGNATURE
                if (realType == "PDF")
                {
                    var (isSigned, sigResult) = ValidatePdfSignature(path);

                    result.IsSignedPdf = isSigned;
                    if (isSigned)
                    {
                        result.PdfCertificates = sigResult;

                        result.PdfSignatureValid = sigResult.Any(s => s.IsValid);
                        result.PdfNotTampered = sigResult.Any(s => !s.DocumentModified);

                        if (!result.PdfSignatureValid)
                            result.Errors.Add("Chữ ký PDF không hợp lệ.");
                        if (!result.PdfNotTampered)
                            result.Errors.Add("PDF bị chỉnh sửa sau khi ký.");
                    }
                }

                // 4. Kiểm tra ảnh bị chỉnh sửa
                if (realType == "JPG" || realType == "PNG")
                {
                    result.ImageEdited = IsImageEdited(path);
                    if (result.ImageEdited)
                    {
                        result.Errors.Add("Ảnh có dấu hiệu đã bị chỉnh sửa.");
                    }
                }

                // 6. Scan VirusTotal
                result.ContainsMalware = false;

                // 7. Office Macro
                result.ContainsMacro = HasOfficeMacro(path);
                if (result.ContainsMacro)
                    result.Errors.Add("File Office chứa macro.");


                // 8. PDF JavaScript
                if (realType == "PDF")
                {
                    result.ContainsPdfJavaScript = HasPdfJavaScript(path);
                    if (result.ContainsPdfJavaScript)
                        result.Errors.Add("PDF chứa JavaScript độc hại.");
                }

                // FINAL
                result.IsValid = result.Errors.Count == 0;
                result.Message = result.IsValid ? "File hợp lệ." : "File không hợp lệ.";

                return result;
            }
            catch (Exception ex)
            {
                result.IsValid = false;
                result.Errors.Add("Lỗi hệ thống: " + ex.Message);
                return result;
            }
        }

       

        // CHECK MAGIC NUMBER
        private static bool CheckMagicNumber(string path, out string fileType)
        {
            var header = File.ReadAllBytes(path).Take(8).ToArray();
            string hex = BitConverter.ToString(header).Replace("-", "");

            if (hex.StartsWith("25504446")) { fileType = "PDF"; return true; }
            if (hex.StartsWith("FFD8FF")) { fileType = "JPG"; return true; }
            if (hex.StartsWith("89504E47")) { fileType = "PNG"; return true; }
            if (hex.StartsWith("504B0304"))
            {
                // ZIP-based file → check Office types
                var type = DetectOfficeFileType(path);
                fileType = type;
                return true;
            }
            if (hex.StartsWith("D0CF11E0")) { fileType = "DOC/XLS (old)"; return true; }

            fileType = "UNKNOWN";
            return false;
        }

        // CHECK FILE NOT CORRUPTED
        private static bool CheckNotCorrupted(string path, string type)
        {
            try
            {
                if (type == "PDF")
                {
                    using var reader = new PdfReader(path);
                    return true;
                }
                if (type == "JPG" || type == "PNG")
                {
                    using var img = System.Drawing.Image.FromFile(path);
                    return true;
                }
                if (type.Contains("ZIP"))
                {
                    using var zip = ZipFile.OpenRead(path);
                    return true;
                }
                if (type == "DOCX")
                {
                    using var zip = ZipFile.OpenRead(path);
                    return zip.Entries.Any(e => e.FullName == "word/document.xml");
                }
                if (type == "XLSX")
                {
                    using var zip = ZipFile.OpenRead(path);
                    return zip.Entries.Any(e => e.FullName == "xl/workbook.xml");
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        // VALIDATE PDF SIGNATURE
        private static (bool, List<PdfCertificateInfo>) ValidatePdfSignature(string path)
        {
            var list = new List<PdfCertificateInfo>();
            try
            {
                using var reader = new PdfReader(path);
                var fields = reader.AcroFields;
                var sigs = fields.GetSignatureNames();

                if (sigs.Count == 0)
                    return (false, list);

                foreach (var sig in sigs)
                {
                    var pk = fields.VerifySignature(sig);
                    var cert = new X509Certificate2(pk.SigningCertificate.GetEncoded());

                    list.Add(new PdfCertificateInfo
                    {
                        Cn = cert.GetNameInfo(X509NameType.SimpleName, false),
                        Issuer = cert.Issuer,
                        SerialNumber = cert.SerialNumber,
                        SignedAt = pk.SignDate.ToLocalTime(),
                        IsValid = pk.Verify(),
                        DocumentModified = !pk.Verify()
                    });
                }

                return (true, list);
            }
            catch
            {
                return (false, list);
            }
        }

        // CHECK IMAGE EDITED
        private static bool IsImageEdited(string path)
        {
            try
            {
                var metadata = ImageMetadataReader.ReadMetadata(path);

                var exif = metadata.OfType<ExifSubIfdDirectory>().FirstOrDefault();
                var software = metadata
                    .SelectMany(dir => dir.Tags)
                    .FirstOrDefault(t => t.Name == "Software");

                if (software != null)
                {
                    string sw = software.Description.ToLower();

                    // nếu ảnh được sửa bằng app chỉnh sửa
                    if (sw.Contains("photoshop") ||
                        sw.Contains("lightroom") ||
                        sw.Contains("zalo") ||
                        sw.Contains("snapseed") ||
                        sw.Contains("picsart"))
                        return true;
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        // CHECK VIRUS
        public static async Task<bool> ScanWithVirusTotalAsync(string filePath, string apiKey)
        {
            try
            {
                using var client = new HttpClient();

                var bytes = await File.ReadAllBytesAsync(filePath);
                var content = new MultipartFormDataContent
        {
            { new ByteArrayContent(bytes), "file", Path.GetFileName(filePath) }
        };

                client.DefaultRequestHeaders.Add("x-apikey", apiKey);

                var response = await client.PostAsync("https://www.virustotal.com/api/v3/files", content);
                string json = await response.Content.ReadAsStringAsync();

                // VirusTotal trả về ID → cần gọi thêm API để lấy kết quả phân tích
                dynamic uploadResult = Newtonsoft.Json.JsonConvert.DeserializeObject(json);
                string analysisId = uploadResult.data.id;

                // Gọi API phân tích
                var result = await client.GetAsync($"https://www.virustotal.com/api/v3/analyses/{analysisId}");
                string analysisJson = await result.Content.ReadAsStringAsync();

                dynamic analysis = Newtonsoft.Json.JsonConvert.DeserializeObject(analysisJson);
                int malicious = analysis.data.attributes.stats.malicious;

                return malicious == 0; // true = không có virus
            }
            catch
            {
                return false; // hoặc return true (tùy hệ thống)
            }
        }

        // CHECK MACRO Office
        public static bool HasOfficeMacro(string filePath)
        {
            try
            {
                using var zip = ZipFile.OpenRead(filePath);

                // Macro nằm trong file:
                // word/vbaProject.bin
                // xl/vbaProject.bin
                // ppt/vbaProject.bin

                return zip.Entries.Any(e =>
                    e.FullName.EndsWith("vbaProject.bin", StringComparison.OrdinalIgnoreCase));
            }
            catch
            {
                return false;
            }
        }

        //CHECK EMBEDDED JAVASCRIPT
        public static bool HasPdfJavaScript(string path)
        {
            try
            {
                using var reader = new PdfReader(path);
                var catalog = reader.Catalog;

                // 1. Check OpenAction
                var openAction = catalog.GetAsDict(PdfName.OPENACTION);
                if (openAction != null)
                {
                    if (openAction.Get(PdfName.S) == PdfName.JAVASCRIPT)
                        return true;

                    if (openAction.Get(PdfName.JS) != null)
                        return true;
                }

                // 2. Check JavaScript name tree
                var names = catalog.GetAsDict(PdfName.NAMES);
                if (names != null)
                {
                    var jsTree = names.GetAsDict(PdfName.JAVASCRIPT);
                    if (jsTree != null)
                        return true;
                }

                // 3. Scan all objects for /JS
                for (int i = 1; i <= reader.XrefSize; i++)
                {
                    var obj = reader.GetPdfObject(i);
                    if (obj is PdfDictionary dict)
                    {
                        if (dict.Contains(PdfName.JS) || dict.Contains(PdfName.JAVASCRIPT))
                            return true;
                    }
                }

                return false;
            }
            catch
            {
                return false;
            }
        }



        private static string DetectOfficeFileType(string path)
        {
            using var zip = ZipFile.OpenRead(path);

            bool isDocx = zip.Entries.Any(e => e.FullName.StartsWith("word/document.xml", StringComparison.OrdinalIgnoreCase));
            if (isDocx) return "DOCX";

            bool isXlsx = zip.Entries.Any(e => e.FullName.StartsWith("xl/workbook.xml", StringComparison.OrdinalIgnoreCase));
            if (isXlsx) return "XLSX";

            bool isPptx = zip.Entries.Any(e => e.FullName.StartsWith("ppt/presentation.xml", StringComparison.OrdinalIgnoreCase));
            if (isPptx) return "PPTX";

            return "ZIP";
        }

    }

    public class FileValidationResult
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
        public List<PdfCertificateInfo> PdfCertificates { get; set; } = new();
        public bool ContainsMacro { get; set; }
        public bool ContainsPdfJavaScript { get; set; }
    }
}
