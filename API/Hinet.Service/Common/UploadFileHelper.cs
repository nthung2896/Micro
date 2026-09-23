using Microsoft.AspNetCore.Http;

// Required for List
// Required for Path, File, Directory
// Required for LINQ methods like Select, Any, Count, Concat

// Required for Exception, StringComparer, Guid

namespace Hinet.Service.Common
{
    // Helper class for individual file operation results
    public class FileOperationResult
    {
        public string Path { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
    }

    // Helper class for the overall cleanup report
    public class CleanupReport
    {
        public List<FileOperationResult> FileResults { get; set; } = new();

        public int DeletedFilesCount =>
            FileResults.Count(r =>
                r.Success && string.IsNullOrEmpty(r.ErrorMessage)); // Count only successful deletions

        public List<string> DeletionErrors => FileResults
            .Where(r => !r.Success && !string.IsNullOrEmpty(r.ErrorMessage))
            .Select(r => $"File '{r.Path}': {r.ErrorMessage}").ToList();

        public int EmptyDirectoriesCleaned { get; set; }
        public List<string> DirectoryCleaningErrors { get; set; } = new();
    }

    public class UploadFileHelper
    {
        private const string BASE_PATH = "wwwroot/uploads";
        private const string DEFAULT_UPLOAD_FOLDER = "files";

        public static string UploadFile(IFormFile file, string folderName = "")
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return "";
                }

                if (string.IsNullOrEmpty(folderName))
                {
                    folderName = DEFAULT_UPLOAD_FOLDER;
                }

                var directoryPath =
                    Path.Combine(Directory.GetCurrentDirectory(), BASE_PATH,
                        folderName); // Added Directory.GetCurrentDirectory() for robust path
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(directoryPath, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }

                // Return path relative to wwwroot
                var relativePathToSave = "/uploads/" + Path.Combine(folderName, fileName).Replace("\\", "/");
                return relativePathToSave;
            }
            catch
            {
                // Consider logging the exception here
                return "";
            }
        }

        public static void RemoveFile(string relativePath) // relativePath is from BASE_PATH
        {
            var fullPath = GetFullPath(relativePath);
            if (!string.IsNullOrEmpty(fullPath))
            {
                try
                {
                    File.Delete(fullPath);
                }
                catch
                {
                    // Consider logging the exception here
                }
            }

            return;
        }

        public static string GetFullPath(string relativePath)
        {
            if (string.IsNullOrEmpty(relativePath))
            {
                return string.Empty;
            }

            var baseFullPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), BASE_PATH));
            var candidate = Path.GetFullPath(Path.Combine(baseFullPath,
                relativePath.TrimStart('/', '\\').Replace("/", Path.DirectorySeparatorChar.ToString())));

            // Path traversal guard: canonical path phải nằm trong baseFullPath
            if (!candidate.StartsWith(baseFullPath + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)
                && !candidate.Equals(baseFullPath, StringComparison.OrdinalIgnoreCase))
            {
                return string.Empty;
            }

            if (File.Exists(candidate))
            {
                return candidate;
            }

            return string.Empty;
        }

        // Sửa đổi phương thức này để chấp nhận một tham số basePath tùy chọn
        public static string GetFullPathFTP(string relativePath, string basePath = BASE_PATH)
        {
            if (string.IsNullOrEmpty(relativePath))
            {
                return string.Empty;
            }

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), basePath,
                relativePath.TrimStart('/', '\\').Replace("/", Path.DirectorySeparatorChar.ToString()));
            if (File.Exists(fullPath))
            {
                return fullPath;
            }

            return string.Empty;
        }

        // This method might be misleading if used for orphaned cleanup.
        // It deletes the files specified in the 'paths' list.
        // For orphaned cleanup, use CleanOrphanedFilesAndEmptyDirectories.
        public static void RemoveFiles(List<string> relativePaths)
        {
            foreach (var path in relativePaths)
            {
                RemoveFile(path);
            }
        }

        public static DownloadData GetDownloadData(string relativePath) // relativePath is from BASE_PATH
        {
            if (string.IsNullOrEmpty(relativePath))
            {
                throw new ArgumentNullException(nameof(relativePath));
            }

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), BASE_PATH,
                relativePath.TrimStart('/', '\\').Replace("/", Path.DirectorySeparatorChar.ToString()));
            var downloadData = new DownloadData
            {
                FileName = Path.GetFileName(fullPath),
                FileBytes = File.ReadAllBytes(fullPath)
            };
            return downloadData;
        }

        public static CleanupReport CleanOrphanedFilesAndEmptyDirectories(IEnumerable<string> dbFileRelativePaths,
            IEnumerable<string> targetFoldersForCleanup)
        {
            var report = new CleanupReport();
            var absoluteBaseUploadPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), BASE_PATH));

            if (!Directory.Exists(absoluteBaseUploadPath))
            {
                report.DirectoryCleaningErrors.Add($"Base upload directory '{absoluteBaseUploadPath}' does not exist.");
                return report;
            }

            var dbFilePathsNormalized = new HashSet<string>(
                dbFileRelativePaths.Select(p => p.Replace("\\", "/").TrimStart('/')),
                StringComparer.OrdinalIgnoreCase
            );

            // 1. Delete orphaned files only within targetFoldersForCleanup
            try
            {
                var filesToProcess = new List<string>();
                foreach (var folderName in targetFoldersForCleanup)
                {
                    if (string.IsNullOrEmpty(folderName))
                    {
                        continue;
                    }

                    var absoluteTargetFolderPath = Path.Combine(absoluteBaseUploadPath, folderName);
                    if (Directory.Exists(absoluteTargetFolderPath))
                    {
                        filesToProcess.AddRange(Directory.GetFiles(absoluteTargetFolderPath, "*.*",
                            SearchOption.AllDirectories));
                    }
                    // Optionally log or add to report if a target folder doesn't exist
                    // report.DirectoryCleaningErrors.Add($"Target folder '{folderName}' not found at '{absoluteTargetFolderPath}'.");
                }

                foreach (var fullPath in filesToProcess)
                {
                    var relativePath = Path.GetRelativePath(absoluteBaseUploadPath, fullPath).Replace("\\", "/");

                    if (!dbFilePathsNormalized.Contains(relativePath))
                    {
                        var fileOpResult = new FileOperationResult { Path = relativePath };
                        try
                        {
                            File.Delete(fullPath);
                            fileOpResult.Success = true;
                        }
                        catch (Exception ex)
                        {
                            fileOpResult.Success = false;
                            fileOpResult.ErrorMessage = ex.Message;
                        }

                        report.FileResults.Add(fileOpResult);
                    }
                }
            }
            catch (Exception ex)
            {
                report.DirectoryCleaningErrors.Add($"Error enumerating or deleting physical files: {ex.Message}");
            }

            // 2. Clean empty directories (do this after file deletion), focusing on targetFoldersForCleanup
            try
            {
                var totalEmptyDirsCleaned = 0;
                foreach (var folderName in targetFoldersForCleanup)
                {
                    if (string.IsNullOrEmpty(folderName))
                    {
                        continue;
                    }

                    var absoluteTargetFolderPath = Path.Combine(absoluteBaseUploadPath, folderName);
                    if (Directory.Exists(absoluteTargetFolderPath))
                    {
                        // CleanEmptySubdirectoriesRecursive will attempt to clean starting from this path
                        // and will delete absoluteTargetFolderPath itself if it becomes empty.
                        totalEmptyDirsCleaned += CleanEmptySubdirectoriesRecursive(absoluteTargetFolderPath,
                            report.DirectoryCleaningErrors);
                    }
                }

                report.EmptyDirectoriesCleaned = totalEmptyDirsCleaned;
            }
            catch (Exception ex)
            {
                report.DirectoryCleaningErrors.Add($"Error initiating empty directory cleanup: {ex.Message}");
            }

            return report;
        }

        private static int CleanEmptySubdirectoriesRecursive(string dirPath, List<string> errors)
        {
            var directoriesCleanedCount = 0;
            if (!Directory.Exists(dirPath))
            {
                return 0;
            }

            try
            {
                // Recursively clean subdirectories first (bottom-up)
                foreach (var subDir in Directory.GetDirectories(dirPath))
                {
                    directoriesCleanedCount += CleanEmptySubdirectoriesRecursive(subDir, errors);
                }

                // Check if current directory is empty (of files and subdirectories)
                if (!Directory.EnumerateFileSystemEntries(dirPath).Any())
                {
                    try
                    {
                        Directory.Delete(dirPath);
                        directoriesCleanedCount++;
                    }
                    catch (IOException ex) // Catch specific IO exceptions
                    {
                        errors.Add($"Error deleting empty directory '{dirPath}': {ex.Message}");
                    }
                    catch (UnauthorizedAccessException ex)
                    {
                        errors.Add($"Access denied deleting empty directory '{dirPath}': {ex.Message}");
                    }
                }
            }
            catch (Exception ex) // Catch errors during directory enumeration or recursion
            {
                errors.Add($"Error processing directory '{dirPath}' for cleanup: {ex.Message}");
            }

            return directoriesCleanedCount;
        }
    }

    public class DownloadData
    {
        public string FileName { get; set; }
        public byte[] FileBytes { get; set; }
    }
}