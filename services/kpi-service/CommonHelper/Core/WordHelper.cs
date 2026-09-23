using System.Diagnostics;

namespace CommonHelper.Core
{
    public class WordHelper
    {
        public class FileConversionResult
        {
            public string? FilePath { get; set; }
            public bool Status { get; set; }
            public string? ErrorMessage { get; set; }
        }

        public FileConversionResult ToPDF(string inputPath, string outputDirectory)
        {
            var libreOfficePath = @"C:\Program Files\LibreOffice\program\soffice.exe";
            var outputFilePath = Path.Combine(outputDirectory, Path.GetFileNameWithoutExtension(inputPath) + ".pdf");


            if (System.IO.File.Exists(outputFilePath))
            {
                System.IO.File.Delete(outputFilePath);
            }

            var result = new FileConversionResult();
            try
            {
                var processInfo = new ProcessStartInfo
                {
                    FileName = libreOfficePath,
                    Arguments = $"--headless --convert-to pdf \"{inputPath}\" --outdir \"{outputDirectory}\" --norestore",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = Process.Start(processInfo);
                if (process != null)
                {
                    process.WaitForExit();

                    var output = process.StandardOutput.ReadToEnd();
                    var error = process.StandardError.ReadToEnd();
                    if (process.ExitCode == 0 && System.IO.File.Exists(outputFilePath))
                    {
                        result.FilePath = outputFilePath;
                        result.Status = true;
                        result.ErrorMessage = string.IsNullOrEmpty(error) ? "No errors" : error.Trim();
                    }
                    else
                    {
                        result.FilePath = null;
                        result.Status = false;
                        result.ErrorMessage = string.IsNullOrEmpty(error) ? "Unknown error" : error.Trim();
                    }
                }
                else
                {
                    result.Status = false;
                    result.ErrorMessage = "Unable to start LibreOffice process.";
                }
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = ex.Message;
            }

            return result;
        }

        public static string ConvertWordToHtml(string filePath)
        {
            var libreOfficePath = @"C:\Program Files\LibreOffice\program\soffice.exe";
            if (!System.IO.File.Exists(filePath))
                throw new FileNotFoundException("File Word không tồn tại", filePath);

            var outputDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "htmloutput");
            Directory.CreateDirectory(outputDirectory);

            var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = libreOfficePath,
                    Arguments = $"--headless --convert-to html:\"XHTML Writer File:UTF8\" --outdir \"{outputDirectory}\" \"{filePath}\"",
                    CreateNoWindow = true,
                    UseShellExecute = false
                }
            };

            process.Start();
            process.WaitForExit();

            var htmlFileName = Path.GetFileNameWithoutExtension(filePath) + ".html";
            var htmlFilePath = Path.Combine(outputDirectory, htmlFileName);

            if (!System.IO.File.Exists(htmlFilePath))
                throw new Exception("Chuyển đổi file Word sang HTML thất bại.");

            // Xóa thư mục tạm chứa html sau khi đọc xong docx
            //Directory.Delete(outputDirectory, recursive: true);


            return System.IO.File.ReadAllText(htmlFilePath);
        }
    }
}
