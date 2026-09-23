using Hinet.FileServer.Helper.HCHelper;
using iText.Forms;
using iText.Kernel.Pdf;
using iText.Signatures;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net.Http;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using iText.Kernel.Pdf.Canvas.Parser;


namespace Hinet.FileServer.Helper.Pdf
{
    public class PdfCertificateInfo
    {
        public string? Cn { get; set; }
        public string? Issuer { get; set; }
        public string? SerialNumber { get; set; }
        public DateTime SignedAt { get; set; }
        public bool IsValid { get; set; }
        public bool IsExpired { get; set; }
        public bool DocumentModified { get; set; }
    }

    public static class PdfHelper
    {

        // Get signature list FROM FILE (LOCAL)

        public static async Task<List<PdfCertificateInfo>> GetCertificateListFromUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return new List<PdfCertificateInfo>();

            string temp = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.pdf");

            try
            {
                using var client = HttpClientHelper.CreateBrowserClient();
                var bytes = await client.GetByteArrayAsync(url);
                await File.WriteAllBytesAsync(temp, bytes);

                return GetCertificateList(temp);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Download/Read signature failed: " + ex);
                return new List<PdfCertificateInfo>();
            }
            finally
            {
                if (File.Exists(temp))
                    File.Delete(temp);
            }
        }


        public static async Task<PdfCertificateInfo?> GetLastValidSignerCertificateFromUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return null;

            var certs = await GetCertificateListFromUrl(url);

            return certs?
                .OrderByDescending(x => x.SignedAt)
                .FirstOrDefault(x =>
                    x.IsValid &&
                    !x.IsExpired &&
                    !x.DocumentModified
                );
        }

        public static PdfCertificateInfo? GetLastValidSignerCertificate(string pdfFilePath)
        {
            if (string.IsNullOrWhiteSpace(pdfFilePath))
                return null;

            var certs = GetCertificateList(pdfFilePath);

            return certs?
                .OrderByDescending(x => x.SignedAt)
                .FirstOrDefault(x =>
                    x.IsValid &&
                    !x.IsExpired &&
                    !x.DocumentModified
                );
        }


        public static List<PdfCertificateInfo> GetCertificateList(string pdfFilePath)
        {
            var result = new List<PdfCertificateInfo>();

            if (string.IsNullOrWhiteSpace(pdfFilePath) || !File.Exists(pdfFilePath))
                return result;

            try
            {
                using var reader = new PdfReader(pdfFilePath);
                using var pdfDoc = new PdfDocument(reader);

                PdfAcroForm form = PdfAcroForm.GetAcroForm(pdfDoc, false);
                if (form == null)
                    return result;

                var signatureUtil = new SignatureUtil(pdfDoc);
                var sigNames = signatureUtil.GetSignatureNames();

                if (sigNames.Count == 0)
                    return result;

                foreach (var sigName in sigNames)
                {
                    PdfPKCS7 pkcs7 = signatureUtil.ReadSignatureData(sigName);

                    var cert = new X509Certificate2(
                        pkcs7.GetSigningCertificate().GetEncoded()
                    );

                    bool expired =
                        DateTime.Now < cert.NotBefore ||
                        DateTime.Now > cert.NotAfter;

                    bool isValid;
                    bool docModified;

                    try
                    {
                        isValid = pkcs7.VerifySignatureIntegrityAndAuthenticity();
                        docModified = !isValid;
                    }
                    catch
                    {
                        // RSA-PSS hiếm / thiếu provider
                        isValid = false;
                        docModified = true;
                    }

                    result.Add(new PdfCertificateInfo
                    {
                        Cn = cert.GetNameInfo(X509NameType.SimpleName, false),
                        Issuer = cert.Issuer,
                        SerialNumber = cert.SerialNumber,
                        SignedAt = pkcs7.GetSignDate().ToLocalTime(),
                        IsValid = isValid,
                        IsExpired = expired,
                        DocumentModified = docModified
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Reading signature failed: " + ex);
            }

            return result;
        }

        public static (string soToKhai, DateTime? ngayDangKy) ExtractInfoFromPdf(string pdfPath)
        {
            var textBuilder = new StringBuilder();

            using (var reader = new PdfReader(pdfPath))
            using (var pdf = new PdfDocument(reader))
            {
                for (int i = 1; i <= pdf.GetNumberOfPages(); i++)
                {
                    textBuilder.Append(
                        PdfTextExtractor.GetTextFromPage(pdf.GetPage(i))
                    );
                }
            }

            var text = textBuilder.ToString();

            // ===== Regex SỐ TỜ KHAI (12 số) =====
            var soToKhaiMatch = Regex.Match(text, @"\b\d{12}\b");

            string soToKhai = soToKhaiMatch.Success
                ? soToKhaiMatch.Value
                : string.Empty;

            // ===== Regex NGÀY ĐĂNG KÝ =====
            var ngayMatch = Regex.Match(text, @"\b\d{2}/\d{2}/\d{4}\b");

            DateTime? ngayDangKy = null;
            if (ngayMatch.Success &&
                DateTime.TryParseExact(
                    ngayMatch.Value,
                    "dd/MM/yyyy",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out var parsedDate))
            {
                ngayDangKy = parsedDate;
            }

            return (soToKhai, ngayDangKy);
        }

        // Validate signature FROM FILE
        public static bool IsSignatureValid(string pdfFilePath)
        {
            var list = GetCertificateList(pdfFilePath);

            return list.Exists(x => x.IsValid && !x.DocumentModified);
        }
        
    }
}
