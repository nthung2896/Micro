using Hinet.Controllers;
using Hinet.Service.MinioService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Hinet.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MinioController : HinetController
    {
        private readonly IMinioService _minioService;

        public MinioController(IMinioService minioService)
        {
            _minioService = minioService;
        }

        /// <summary>
        /// Upload file lên MinIO
        /// </summary>
        [HttpPost("upload")]
        [AllowAnonymous]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromQuery] string? folderPath = null)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("File không hợp lệ.");
            }

            try
            {
                var objectName = await _minioService.UploadFileAsync(file, folderPath);
                var url = await _minioService.GetPresignedUrlAsync(objectName);
                return Ok(new
                {
                    status = true,
                    message = "Upload file lên MinIO thành công",
                    data = new
                    {
                        objectName,
                        fileName = file.FileName,
                        size = file.Length,
                        presignedUrl = url
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = false, message = "Lỗi upload MinIO: " + ex.Message });
            }
        }

        /// <summary>
        /// Lấy link xem/tải tạm thời (Presigned URL) cho file trên MinIO
        /// </summary>
        [HttpGet("presigned-url")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPresignedUrl([FromQuery] string objectName, [FromQuery] int expiryInSeconds = 3600)
        {
            if (string.IsNullOrWhiteSpace(objectName))
            {
                return BadRequest("objectName không được để trống.");
            }

            try
            {
                var exists = await _minioService.FileExistsAsync(objectName);
                if (!exists)
                {
                    return NotFound(new { status = false, message = "File không tồn tại trên MinIO." });
                }

                var url = await _minioService.GetPresignedUrlAsync(objectName, expiryInSeconds);
                return Ok(new { status = true, data = url });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = false, message = "Lỗi lấy presigned URL: " + ex.Message });
            }
        }

        /// <summary>
        /// Tải file từ MinIO theo objectName
        /// </summary>
        [HttpGet("download")]
        [AllowAnonymous]
        public async Task<IActionResult> Download([FromQuery] string objectName)
        {
            if (string.IsNullOrWhiteSpace(objectName))
            {
                return BadRequest("objectName không được để trống.");
            }

            try
            {
                var exists = await _minioService.FileExistsAsync(objectName);
                if (!exists)
                {
                    return NotFound("File không tồn tại trên MinIO.");
                }

                var stream = await _minioService.GetFileStreamAsync(objectName);
                var fileName = System.IO.Path.GetFileName(objectName);
                return File(stream, "application/octet-stream", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi tải file từ MinIO: " + ex.Message);
            }
        }

        /// <summary>
        /// Stream file từ MinIO theo objectName (dùng để hiển thị ảnh/file trên HTML)
        /// Route: GET /api/Minio/view/{*objectName} hoặc GET /api/Minio/get-file?path=...
        /// </summary>
        [HttpGet("view/{*objectName}")]
        [HttpGet("get-file")]
        [AllowAnonymous]
        public async Task<IActionResult> ViewFile([FromRoute] string? objectName = null, [FromQuery] string? path = null)
        {
            var targetPath = !string.IsNullOrWhiteSpace(objectName) ? objectName : path;
            if (string.IsNullOrWhiteSpace(targetPath))
            {
                return NotFound();
            }

            var cleanPath = targetPath.TrimStart('/', '\\').Replace('\\', '/');
            if (cleanPath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
            {
                cleanPath = cleanPath.Substring("uploads/".Length);
            }

            if (await _minioService.FileExistsAsync(cleanPath))
            {
                var stream = await _minioService.GetFileStreamAsync(cleanPath);
                var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
                var contentType = provider.TryGetContentType(cleanPath, out var ct) ? ct : "application/octet-stream";
                return File(stream, contentType);
            }

            var localPath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", "uploads", cleanPath.Replace('/', System.IO.Path.DirectorySeparatorChar));
            if (System.IO.File.Exists(localPath))
            {
                var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
                var contentType = provider.TryGetContentType(localPath, out var ct) ? ct : "application/octet-stream";
                return File(System.IO.File.OpenRead(localPath), contentType);
            }

            return NotFound();
        }

        /// <summary>
        /// Xóa file khỏi MinIO
        /// </summary>
        [HttpDelete("delete")]
        [AllowAnonymous]
        public async Task<IActionResult> Delete([FromQuery] string objectName)
        {
            if (string.IsNullOrWhiteSpace(objectName))
            {
                return BadRequest("objectName không được để trống.");
            }

            try
            {
                var result = await _minioService.DeleteFileAsync(objectName);
                return Ok(new { status = result, message = result ? "Đã xóa file thành công" : "Xóa file thất bại" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = false, message = "Lỗi xóa file MinIO: " + ex.Message });
            }
        }
    }
}
