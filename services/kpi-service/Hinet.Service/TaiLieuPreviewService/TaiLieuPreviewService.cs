using Hinet.Model.Entities;
using Hinet.Service.MinioService;
using Hinet.Service.TaiLieuDinhKemService;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using System.IO.Compression;

namespace Hinet.Service.TaiLieuPreviewService
{
    public sealed class TaiLieuPreviewService : ITaiLieuPreviewService
    {
        private const long MaxTemporaryFileBytes = 10 * 1024 * 1024;
        private readonly ITaiLieuDinhKemService _attachmentService;
        private readonly IWebHostEnvironment _environment;
        private readonly LibreOfficePreviewOptions _options;
        private readonly PreviewConversionCoordinator _coordinator;
        private readonly ILogger<TaiLieuPreviewService> _logger;
        private readonly IMinioService _minioService;

        public TaiLieuPreviewService(
            ITaiLieuDinhKemService attachmentService,
            IWebHostEnvironment environment,
            IOptions<LibreOfficePreviewOptions> options,
            PreviewConversionCoordinator coordinator,
            ILogger<TaiLieuPreviewService> logger,
            IMinioService minioService)
        {
            _attachmentService = attachmentService;
            _environment = environment;
            _options = options.Value;
            _coordinator = coordinator;
            _logger = logger;
            _minioService = minioService;
        }

        public async Task<(Stream Stream, string FileName, string ContentType)> OpenPreviewAsync(Guid attachmentId, CancellationToken cancellationToken)
        {
            var attachment = await GetAttachmentAsync(attachmentId);
            var extension = PreviewFileTypeCatalog.NormalizeExtension(attachment.Extension, attachment.TenTaiLieu);
            if (!PreviewFileTypeCatalog.IsAllowed(extension))
                throw new PreviewUnsupportedException("Định dạng file này chưa được hỗ trợ xem trước.");

            if (!PreviewFileTypeCatalog.IsOffice(extension))
            {
                var originalStream = await OpenOriginalStreamAsync(attachment, cancellationToken);
                return (
                    originalStream,
                    SafeFileName(attachment.TenTaiLieu, extension),
                    PreviewFileTypeCatalog.GetContentType(extension));
            }

            var attachmentLock = _coordinator.GetAttachmentLock(attachmentId);
            await attachmentLock.WaitAsync(cancellationToken);
            try
            {
                attachment = await GetAttachmentAsync(attachmentId);
                var cachedPath = TryResolveCachedPath(attachment.DuongDanFilePDF);
                if (cachedPath != null && File.Exists(cachedPath))
                    return (
                        OpenRead(cachedPath),
                        Path.ChangeExtension(SafeFileName(attachment.TenTaiLieu, extension), ".pdf"),
                        "application/pdf");

                var (sourcePath, isTempSource) = await ResolveSourcePathAsync(attachment, extension, cancellationToken);

                try
                {
                    var cacheRoot = ResolveConfiguredDirectory(_options.CacheDirectory, "wwwroot/preview-cache");
                    Directory.CreateDirectory(cacheRoot);
                    var targetPath = Path.Combine(cacheRoot, $"{attachment.Id}.pdf");
                    if (File.Exists(targetPath)) File.Delete(targetPath);
                    await ConvertOfficeToPdfAsync(sourcePath, targetPath, cancellationToken);

                    try
                    {
                        attachment.DuongDanFilePDF = Path.GetRelativePath(_environment.WebRootPath, targetPath)
                            .Replace(Path.DirectorySeparatorChar, '/');
                        await _attachmentService.UpdateAsync(attachment);
                    }
                    catch
                    {
                        try { File.Delete(targetPath); } catch { }
                        throw;
                    }
                    return (
                        OpenRead(targetPath),
                        Path.ChangeExtension(SafeFileName(attachment.TenTaiLieu, extension), ".pdf"),
                        "application/pdf");
                }
                finally
                {
                    if (isTempSource && File.Exists(sourcePath))
                    {
                        try { File.Delete(sourcePath); } catch { }
                    }
                }
            }
            finally
            {
                attachmentLock.Release();
            }
        }

        private async Task<Stream> OpenOriginalStreamAsync(TaiLieuDinhKem attachment, CancellationToken cancellationToken)
        {
            if (await _minioService.FileExistsAsync(attachment.DuongDanFile, cancellationToken))
                return await _minioService.GetFileStreamAsync(attachment.DuongDanFile, cancellationToken);

            var path = ResolveOriginalPath(attachment.DuongDanFile);
            if (!File.Exists(path))
            {
                _logger.LogWarning("Attachment {AttachmentId} points to missing physical file {PhysicalPath} (stored path: {StoredPath})", attachment.Id, path, attachment.DuongDanFile);
                throw new PreviewNotFoundException("Không tìm thấy file đính kèm.");
            }

            return OpenRead(path);
        }

        private async Task<(string SourcePath, bool IsTemporary)> ResolveSourcePathAsync(
            TaiLieuDinhKem attachment,
            string extension,
            CancellationToken cancellationToken)
        {
            if (await _minioService.FileExistsAsync(attachment.DuongDanFile, cancellationToken))
            {
                var temporaryPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}{extension}");
                await using var minioStream = await _minioService.GetFileStreamAsync(attachment.DuongDanFile, cancellationToken);
                await using var fileStream = new FileStream(temporaryPath, FileMode.CreateNew, FileAccess.Write, FileShare.None);
                await minioStream.CopyToAsync(fileStream, cancellationToken);
                return (temporaryPath, true);
            }

            var sourcePath = ResolveOriginalPath(attachment.DuongDanFile);
            if (!File.Exists(sourcePath))
                throw new PreviewNotFoundException("Không tìm thấy file đính kèm.");

            return (sourcePath, false);
        }

        public async Task<(Stream Stream, string FileName, string ContentType)> OpenDownloadAsync(Guid attachmentId, CancellationToken cancellationToken)
        {
            var attachment = await GetAttachmentAsync(attachmentId);
            Stream stream;

            if (await _minioService.FileExistsAsync(attachment.DuongDanFile, cancellationToken))
            {
                stream = await _minioService.GetFileStreamAsync(attachment.DuongDanFile, cancellationToken);
            }
            else
            {
                var path = ResolveOriginalPath(attachment.DuongDanFile);
                if (!File.Exists(path))
                {
                    _logger.LogWarning("Attachment {AttachmentId} points to missing physical file {PhysicalPath} (stored path: {StoredPath})", attachment.Id, path, attachment.DuongDanFile);
                    throw new PreviewNotFoundException("Không tìm thấy file đính kèm.");
                }
                stream = OpenRead(path);
            }
            var extension = PreviewFileTypeCatalog.NormalizeExtension(attachment.Extension, attachment.TenTaiLieu);
            var contentType = PreviewFileTypeCatalog.GetContentType(extension);
            if (contentType == "application/octet-stream" && new FileExtensionContentTypeProvider().TryGetContentType(attachment.TenTaiLieu, out var detected))
                contentType = detected;
            return (stream, SafeFileName(attachment.TenTaiLieu, extension), contentType);
        }

        public async Task<(byte[] Content, string FileName, string ContentType)> PreviewTemporaryAsync(IFormFile file, CancellationToken cancellationToken)
        {
            if (file == null || file.Length == 0)
                throw new PreviewConversionException("File tải lên bị rỗng.");
            if (file.Length > MaxTemporaryFileBytes)
                throw new PreviewUnsupportedException("Dung lượng file không được vượt quá 10 MB.");

            var extension = PreviewFileTypeCatalog.NormalizeExtension(null, file.FileName);
            if (!PreviewFileTypeCatalog.IsAllowed(extension))
                throw new PreviewUnsupportedException("Định dạng file này chưa được hỗ trợ xem trước.");

            if (!PreviewFileTypeCatalog.IsOffice(extension))
            {
                await using var input = file.OpenReadStream();
                await using var buffer = new MemoryStream();
                await input.CopyToAsync(buffer, cancellationToken);
                return (
                    buffer.ToArray(),
                    SafeFileName(file.FileName, extension),
                    PreviewFileTypeCatalog.GetContentType(extension));
            }

            var jobDirectory = CreateJobDirectory();
            try
            {
                var sourcePath = Path.Combine(jobDirectory, $"source{extension}");
                await using (var output = new FileStream(sourcePath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                    await file.CopyToAsync(output, cancellationToken);
                if (!IsValidOfficeFile(sourcePath, extension))
                    throw new PreviewConversionException("File Office không hợp lệ hoặc đã bị hỏng.");

                var resultPath = Path.Combine(jobDirectory, "result.pdf");
                await ConvertOfficeToPdfAsync(sourcePath, resultPath, cancellationToken, jobDirectory);
                return (
                    await File.ReadAllBytesAsync(resultPath, cancellationToken),
                    Path.ChangeExtension(SafeFileName(file.FileName, extension), ".pdf"),
                    "application/pdf");
            }
            finally
            {
                DeleteDirectoryQuietly(jobDirectory);
            }
        }

        private async Task<TaiLieuDinhKem> GetAttachmentAsync(Guid id) =>
            await _attachmentService.GetById(id) ?? throw new PreviewNotFoundException("Không tìm thấy tài liệu đính kèm.");

        private async Task ConvertOfficeToPdfAsync(string sourcePath, string targetPath, CancellationToken cancellationToken, string? existingJobDirectory = null)
        {
            if (!File.Exists(sourcePath))
            {
                _logger.LogWarning("Office source file does not exist at {SourcePath}", sourcePath);
                throw new PreviewNotFoundException("Không tìm thấy file đính kèm.");
            }
            if (!IsValidOfficeFile(sourcePath, Path.GetExtension(sourcePath)))
                throw new PreviewConversionException("File Office không hợp lệ hoặc đã bị hỏng.");
            if (string.IsNullOrWhiteSpace(_options.ExecutablePath) || !File.Exists(_options.ExecutablePath))
                throw new PreviewConfigurationException("LibreOffice chưa được cấu hình trên máy chủ.");

            var ownsJobDirectory = existingJobDirectory == null;
            var jobDirectory = existingJobDirectory ?? CreateJobDirectory();
            var outputDirectory = Path.Combine(jobDirectory, "output");
            var profileDirectory = Path.Combine(jobDirectory, "libreoffice-profile");
            Directory.CreateDirectory(outputDirectory);
            Directory.CreateDirectory(profileDirectory);
            var convertedPath = Path.Combine(outputDirectory, Path.GetFileNameWithoutExtension(sourcePath) + ".pdf");

            var hasConversionSlot = false;
            try
            {
                await _coordinator.WaitForConversionSlotAsync(cancellationToken);
                hasConversionSlot = true;
                using var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = _options.ExecutablePath,
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        WorkingDirectory = jobDirectory,
                    }
                };
                process.StartInfo.ArgumentList.Add("--headless");
                process.StartInfo.ArgumentList.Add($"-env:UserInstallation={new Uri(profileDirectory + Path.DirectorySeparatorChar).AbsoluteUri}");
                process.StartInfo.ArgumentList.Add("--nologo");
                process.StartInfo.ArgumentList.Add("--nodefault");
                process.StartInfo.ArgumentList.Add("--nolockcheck");
                process.StartInfo.ArgumentList.Add("--nofirststartwizard");
                process.StartInfo.ArgumentList.Add("--convert-to");
                process.StartInfo.ArgumentList.Add("pdf");
                process.StartInfo.ArgumentList.Add("--outdir");
                process.StartInfo.ArgumentList.Add(outputDirectory);
                process.StartInfo.ArgumentList.Add(sourcePath);

                if (!process.Start()) throw new PreviewConversionException("Không thể khởi động LibreOffice.");
                var stdoutTask = process.StandardOutput.ReadToEndAsync();
                var stderrTask = process.StandardError.ReadToEndAsync();
                var timeout = TimeSpan.FromSeconds(Math.Max(1, _options.ConversionTimeoutSeconds));
                var exitTask = process.WaitForExitAsync(CancellationToken.None);
                var completed = await Task.WhenAny(exitTask, Task.Delay(timeout, cancellationToken));
                if (completed != exitTask)
                {
                    TryKillProcessTree(process);
                    try { await Task.WhenAny(exitTask, Task.Delay(TimeSpan.FromSeconds(5), CancellationToken.None)); } catch { }
                    cancellationToken.ThrowIfCancellationRequested();
                    _logger.LogWarning("LibreOffice timed out converting {SourcePath}", sourcePath);
                    throw new PreviewTimeoutException("LibreOffice chuyển đổi quá thời gian cho phép.");
                }

                await exitTask;
                var stdout = await stdoutTask;
                var stderr = await stderrTask;
                if (process.ExitCode != 0 || !File.Exists(convertedPath))
                {
                    _logger.LogWarning("LibreOffice conversion failed. ExitCode={ExitCode}, Output={Output}, Error={Error}", process.ExitCode, stdout, stderr);
                    throw new PreviewConversionException("Không thể chuyển đổi file Office sang PDF.");
                }

                Directory.CreateDirectory(Path.GetDirectoryName(targetPath)!);
                File.Move(convertedPath, targetPath, true);
            }
            catch (PreviewTimeoutException) { throw; }
            catch (PreviewConfigurationException) { throw; }
            catch (PreviewConversionException) { throw; }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected Office conversion error for {SourcePath}", sourcePath);
                throw new PreviewConversionException("Không thể chuyển đổi file Office sang PDF.");
            }
            finally
            {
                if (hasConversionSlot) _coordinator.ReleaseConversionSlot();
                if (ownsJobDirectory) DeleteDirectoryQuietly(jobDirectory);
            }
        }

        private string ResolveOriginalPath(string relativePath)
        {
            var uploadsRoot = Path.GetFullPath(Path.Combine(_environment.WebRootPath, "uploads"));
            if (string.IsNullOrWhiteSpace(relativePath))
                throw new PreviewNotFoundException("Đường dẫn file không hợp lệ.");
            var rawPath = relativePath.Replace('/', Path.DirectorySeparatorChar);
            var startsAtUploads = rawPath.StartsWith(Path.DirectorySeparatorChar + "uploads" + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase);
            if (Path.IsPathFullyQualified(rawPath) && !startsAtUploads)
                throw new PreviewNotFoundException("Đường dẫn file không hợp lệ.");
            var normalized = relativePath.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar);
            if (normalized.StartsWith("uploads" + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
                normalized = normalized[("uploads".Length + 1)..];
            return EnsureInsideRoot(uploadsRoot, Path.Combine(uploadsRoot, normalized));
        }

        private string? TryResolveCachedPath(string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath)) return null;
            var cacheRoot = ResolveConfiguredDirectory(_options.CacheDirectory, "wwwroot/preview-cache");
            var candidate = Path.IsPathFullyQualified(relativePath)
                ? relativePath
                : Path.Combine(_environment.WebRootPath, relativePath.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar));
            try { return EnsureInsideRoot(cacheRoot, candidate); }
            catch (PreviewNotFoundException) { return null; }
        }

        private string ResolveConfiguredDirectory(string configuredPath, string defaultPath)
        {
            var value = string.IsNullOrWhiteSpace(configuredPath) ? defaultPath : configuredPath;
            return Path.GetFullPath(Path.IsPathRooted(value) ? value : Path.Combine(_environment.ContentRootPath, value));
        }

        private string CreateJobDirectory()
        {
            var tempRoot = ResolveConfiguredDirectory(_options.TempDirectory, "preview-temp");
            Directory.CreateDirectory(tempRoot);
            var jobDirectory = Path.Combine(tempRoot, Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(jobDirectory);
            return jobDirectory;
        }

        private static string EnsureInsideRoot(string root, string candidate)
        {
            var fullRoot = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            var fullCandidate = Path.GetFullPath(candidate);
            if (!fullCandidate.StartsWith(fullRoot, StringComparison.OrdinalIgnoreCase))
                throw new PreviewNotFoundException("Đường dẫn file không hợp lệ.");
            return fullCandidate;
        }

        private static FileStream OpenRead(string path) => new(path, FileMode.Open, FileAccess.Read, FileShare.Read);

        private static string SafeFileName(string? fileName, string fallbackExtension)
        {
            var safeName = Path.GetFileName(fileName ?? string.Empty);
            foreach (var invalid in Path.GetInvalidFileNameChars()) safeName = safeName.Replace(invalid, '_');
            return string.IsNullOrWhiteSpace(safeName) ? "tai-lieu" + fallbackExtension : safeName;
        }

        private static bool IsValidOfficeFile(string path, string extension)
        {
            extension = PreviewFileTypeCatalog.NormalizeExtension(extension, path);
            if (!PreviewFileTypeCatalog.IsOffice(extension) || !File.Exists(path)) return false;

            if (extension is ".doc" or ".xls" or ".ppt")
            {
                try
                {
                    using var stream = OpenRead(path);
                    var header = new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 };
                    var actual = new byte[header.Length];
                    return stream.Read(actual, 0, actual.Length) == actual.Length && actual.SequenceEqual(header);
                }
                catch (IOException) { return false; }
            }

            var requiredEntryPrefix = extension switch
            {
                ".docx" => "word/",
                ".xlsx" => "xl/",
                ".pptx" => "ppt/",
                _ => string.Empty,
            };

            try
            {
                using var archive = ZipFile.OpenRead(path);
                return archive.Entries.Any(entry => string.Equals(entry.FullName, "[Content_Types].xml", StringComparison.OrdinalIgnoreCase))
                    && archive.Entries.Any(entry => entry.FullName.StartsWith(requiredEntryPrefix, StringComparison.OrdinalIgnoreCase));
            }
            catch (InvalidDataException) { return false; }
            catch (IOException) { return false; }
        }

        private static void TryKillProcessTree(Process process)
        {
            try { if (!process.HasExited) process.Kill(true); } catch { }
        }

        private static void DeleteDirectoryQuietly(string path)
        {
            try { if (Directory.Exists(path)) Directory.Delete(path, true); } catch { }
        }
    }
}
