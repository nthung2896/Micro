using Hinet.Api.Dto;
using Hinet.Controllers;
using Hinet.Model.Entities;
using Hinet.Service.Core.Mapper;
using Hinet.Service.Dto;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Service.TaiLieuDinhKemService.Dto;
using Hinet.Service.TaiLieuDinhKemService.Request;
using Hinet.Service.TaiLieuPreviewService;
using Hinet.Service.TinhService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using VKS.Controllers;
using VKS.Domain.Entites;

namespace VKS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiLieuDinhKemController : HinetController
    {
        // Chỉ cho phép FileType là chữ/số/dấu gạch — chặn path traversal "../"
        private static readonly System.Text.RegularExpressions.Regex SafeFolderRegex =
            new("^[a-zA-Z0-9_-]{1,32}$", System.Text.RegularExpressions.RegexOptions.Compiled);

        private static string SanitizeFolder(string? fileType)
            => !string.IsNullOrEmpty(fileType) && SafeFolderRegex.IsMatch(fileType) ? fileType! : "files";

        private static bool IsExtensionAllowed(string fileName)
            => PreviewFileTypeCatalog.IsAllowed(Path.GetExtension(fileName));

        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly IMapper _mapper;
        private readonly ITaiLieuPreviewService _previewService;
        private readonly Hinet.Service.MinioService.IMinioService _minioService;

        public TaiLieuDinhKemController(ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ITaiLieuPreviewService previewService,
            Hinet.Service.MinioService.IMinioService minioService)
        {
            _taiLieuDinhKemService = taiLieuDinhKemService;
            _mapper = mapper;
            _previewService = previewService;
            _minioService = minioService;
        }

        [AllowAnonymous]
        [HttpGet("/uploads/{*filePath}")]
        public async Task<IActionResult> GetUploadedFile([FromRoute] string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
            {
                return NotFound();
            }
            var cleanPath = filePath.TrimStart('/', '\\').Replace('\\', '/');
            
            if (cleanPath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
            {
                cleanPath = cleanPath.Substring("uploads/".Length);
            }

            var localPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", cleanPath.Replace('/', Path.DirectorySeparatorChar));
           
            if (System.IO.File.Exists(localPath))
            {
                var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
                var contentType = provider.TryGetContentType(localPath, out var ct) ? ct : "application/octet-stream";
                return File(System.IO.File.OpenRead(localPath), contentType);
            }

            if (await _minioService.FileExistsAsync(cleanPath))
            {
                var stream = await _minioService.GetFileStreamAsync(cleanPath);
                var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
                var contentType = provider.TryGetContentType(cleanPath, out var ct) ? ct : "application/octet-stream";
                return File(stream, contentType);
            }

            return NotFound();
        }

        [Authorize]
        [HttpGet("{id:guid}/preview")]
        public async Task<IActionResult> Preview([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _previewService.OpenPreviewAsync(id, cancellationToken);
                Response.Headers.ContentDisposition = $"inline; filename*=UTF-8''{System.Uri.EscapeDataString(result.FileName)}";
                return File(result.Stream, result.ContentType, enableRangeProcessing: true);
            }
            catch (Exception ex) { return PreviewError(ex); }
        }

        [Authorize]
        [HttpGet("{id:guid}/download")]
        public async Task<IActionResult> Download([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _previewService.OpenDownloadAsync(id, cancellationToken);
                return File(result.Stream, result.ContentType, result.FileName, enableRangeProcessing: true);
            }
            catch (Exception ex) { return PreviewError(ex); }
        }

        [Authorize]
        [HttpPost("preview-temp")]
        // Chừa multipart overhead; dịch vụ vẫn kiểm tra chính xác kích thước file tối đa 10 MB.
        [RequestSizeLimit(11 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 11 * 1024 * 1024)]
        public async Task<IActionResult> PreviewTemporary([FromForm] IFormFile file, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _previewService.PreviewTemporaryAsync(file, cancellationToken);
                Response.Headers.ContentDisposition = $"inline; filename*=UTF-8''{System.Uri.EscapeDataString(result.FileName)}";
                return File(result.Content, result.ContentType);
            }
            catch (Exception ex) { return PreviewError(ex); }
        }

        private IActionResult PreviewError(Exception exception) => exception switch
        {
            PreviewNotFoundException => NotFound(new ProblemDetails { Status = 404, Title = exception.Message }),
            PreviewUnsupportedException => StatusCode(StatusCodes.Status415UnsupportedMediaType, new ProblemDetails { Status = 415, Title = exception.Message }),
            PreviewConversionException => UnprocessableEntity(new ProblemDetails { Status = 422, Title = exception.Message }),
            PreviewTimeoutException => StatusCode(StatusCodes.Status504GatewayTimeout, new ProblemDetails { Status = 504, Title = exception.Message }),
            PreviewConfigurationException => StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails { Status = 500, Title = exception.Message }),
            OperationCanceledException => StatusCode(499),
            _ => StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails { Status = 500, Title = "Không thể xử lý file xem trước." }),
        };

        [AllowAnonymous]
        [HttpPost("upload")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        //ignore-sync
        public async Task<DataResponse<List<TaiLieuDinhKemDto>>> Upload([FromForm] UploadFileRequest form)
        {
            try
            {
                var result = new List<TaiLieuDinhKemDto>();
                if (form.Files == null || form.Files.Count == 0)
                {
                    throw new Exception("Không có file nào được chọn");
                }

                var date = DateTime.Now.ToString("yyyyMMdd");
                var entitiesToSave = new List<TaiLieuDinhKem>();

                foreach (var file in form.Files)
                {
                    // Kiểm tra file rỗng
                    if (file == null || file.Length == 0)
                    {
                        return DataResponse<List<TaiLieuDinhKemDto>>.False("Uploaded file is empty ");
                    }

                    var extension = Path.GetExtension(file.FileName)
                                        .Replace(".", "")
                                        .ToLower();

                    if (!IsExtensionAllowed(file.FileName))
                    {
                        return DataResponse<List<TaiLieuDinhKemDto>>.False(
                            $"Định dạng file không cho phép: {file.FileName}");
                    }
                    var safeFolder = SanitizeFolder(form.FileType);
                    var id = Guid.NewGuid();
                    var customFileName = $"{id}_{Path.GetFileName(file.FileName)}";

                    var objectName = await _minioService.UploadFileAsync(file, safeFolder, customFileName);

                    var dto = new TaiLieuDinhKemDto
                    {
                        Id = id,
                        TenTaiLieu = file.FileName,
                        Extension = extension,
                        DuongDanFile = objectName,
                        LoaiTaiLieu = safeFolder,
                        KichThuoc = file.Length / 1024,
                        ItemId = form.ItemId,
                        UserId = UserId,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        CreatedId = UserId,
                        UpdatedId = UserId,
                    };

                    result.Add(dto);
                    entitiesToSave.Add((TaiLieuDinhKem)dto);
                }
                await _taiLieuDinhKemService.CreateAsync(entitiesToSave);

                return DataResponse<List<TaiLieuDinhKemDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<TaiLieuDinhKemDto>>.False("Lỗi khi upload file: " + ex.Message);
            }
        }

        [HttpPost("uploadFile")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        //ignore-sync
        public async Task<DataResponse<List<TaiLieuDinhKemDto>>> UploadFile([FromForm] UploadFileRequest form)
        {
            try
            {
                var result = new List<TaiLieuDinhKemDto>();
                if (form.Files == null || form.Files.Count == 0)
                {
                    throw new Exception("Không có file nào được chọn");
                }

                var date = DateTime.Now.ToString("yyyyMMdd");
                foreach (var file in form.Files)
                {
                    // Kiểm tra file rỗng
                    if (file == null || file.Length == 0)
                    {
                        return DataResponse<List<TaiLieuDinhKemDto>>.False("Uploaded file is empty ");
                    }

                    var extension = Path.GetExtension(file.FileName)
                                        .Replace(".", "")
                                        .ToLower();

                    if (!IsExtensionAllowed(file.FileName))
                    {
                        return DataResponse<List<TaiLieuDinhKemDto>>.False(
                            $"Định dạng file không cho phép: {file.FileName}");
                    }
                    var safeFolder = SanitizeFolder(form.FileType);
                    var id = Guid.NewGuid();
                    var customFileName = $"{id}_{Path.GetFileName(file.FileName)}";

                    var objectName = await _minioService.UploadFileAsync(file, safeFolder, customFileName);

                    var dto = new TaiLieuDinhKemDto
                    {
                        Id = id,
                        TenTaiLieu = file.FileName,
                        Extension = extension,
                        DuongDanFile = objectName,
                        LoaiTaiLieu = safeFolder,
                        KichThuoc = file.Length / 1024,
                        ItemId = form.ItemId,
                        UserId = UserId,
                        CreatedDate = DateTime.Now,
                        UpdatedDate = DateTime.Now,
                        CreatedId = UserId,
                        UpdatedId = UserId,
                    };

                    result.Add(dto);
                }

                return DataResponse<List<TaiLieuDinhKemDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<TaiLieuDinhKemDto>>.False("Lỗi khi upload file: " + ex.Message);
            }
        }

        [HttpPost("uploadDocument")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        public async Task<DataResponse<List<TaiLieuDinhKemDto>>> UploadDocument([FromForm] UploadFileRequest form)
        {
            try
            {
                var result = new List<TaiLieuDinhKemDto>();
                if (form.Files == null || form.Files.Count == 0)
                {
                    return DataResponse<List<TaiLieuDinhKemDto>>.False("Không có file nào được chọn.");
                }

                foreach (var file in form.Files)
                {
                    if (!IsExtensionAllowed(file.FileName))
                    {
                        return DataResponse<List<TaiLieuDinhKemDto>>.False(
                            $"Định dạng file không cho phép: {file.FileName}");
                    }
                    using var stream = file.OpenReadStream();

                    var folderType = SanitizeFolder(form.FileType);
                    var dbPath = await _taiLieuDinhKemService.UploadDocumentAsync(stream, file.FileName, folderType);

                    var dto = new TaiLieuDinhKemDto
                    {
                        TenTaiLieu = file.FileName,
                        Extension = Path.GetExtension(file.FileName).Replace(".", "").ToLower(),
                        DuongDanFile = dbPath,
                        LoaiTaiLieu = folderType,
                        KichThuoc = file.Length / 1024
                    };

                    result.Add(dto);
                }

                return DataResponse<List<TaiLieuDinhKemDto>>.Success(result);
            }
            catch (ArgumentException argEx)
            {
                return DataResponse<List<TaiLieuDinhKemDto>>.False(argEx.Message);
            }
            catch (Exception ex)
            {
                return DataResponse<List<TaiLieuDinhKemDto>>.False("Lỗi hệ thống khi lưu file.");
            }
        }

        [HttpPost("uploadAndSaveDb")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(ValueLengthLimit = int.MaxValue, MultipartBodyLengthLimit = int.MaxValue)]
        public async Task<DataResponse<TaiLieuDinhKemDto>> UploadAndSaveDb([FromForm] UploadAndSaveFileRequest form)
        {
            try
            {
                if (form.File == null || form.File.Length == 0)
                {
                    return DataResponse<TaiLieuDinhKemDto>.False("Không có file nào được chọn.");
                }
                if (!IsExtensionAllowed(form.File.FileName))
                {
                    return DataResponse<TaiLieuDinhKemDto>.False(
                        $"Định dạng file không cho phép: {form.File.FileName}");
                }

                using var stream = form.File.OpenReadStream();

                var folderType = SanitizeFolder(form.FolderType);

                var savedEntity = await _taiLieuDinhKemService.UploadAndSaveDb(
                    stream,
                    form.File.FileName,
                    form.TenTaiLieuText,
                    folderType,
                    form.ItemId,
                    UserId
                );

                var dto = new TaiLieuDinhKemDto
                {
                    Id = savedEntity.Id,
                    TenTaiLieu = savedEntity.TenTaiLieu,
                    Extension = savedEntity.Extension,
                    DuongDanFile = savedEntity.DuongDanFile,
                    LoaiTaiLieu = savedEntity.LoaiTaiLieu,
                    KichThuoc = savedEntity.KichThuoc
                };

                return DataResponse<TaiLieuDinhKemDto>.Success(dto);
            }
            catch (ArgumentException argEx)
            {
                return DataResponse<TaiLieuDinhKemDto>.False(argEx.Message);
            }
            catch (Exception ex)
            {
                return DataResponse<TaiLieuDinhKemDto>.False("Lỗi hệ thống khi lưu file: " + ex.Message);
            }
        }

        [HttpGet("GetFileInfo/{id}")]
        public async Task<DataResponse<FileInfoResponseDto>> GetFileInfo(Guid id)
        {
            var result = await _taiLieuDinhKemService.GetFileInfo(id);

            if (result.IsSuccess)
            {
                return DataResponse<FileInfoResponseDto>.Success(result.Data, result.Message);
            }

            return DataResponse<FileInfoResponseDto>.False(result.Message);
        }

        [HttpDelete("delete")]
        //ignore-sync
        public async Task<DataResponse> Delete([FromBody] DeleteFileRequest model)
        {
            try
            {
                await _taiLieuDinhKemService.DeleteAsync(model.Ids ?? new List<Guid>(), UserId);
                return DataResponse.Success(true);
            }
            catch (Exception ex)
            {
                return DataResponse.False("Xóa file đính kèm thất bại" + ex.Message);
            }
        }

        [HttpGet("GetByItemId/{itemId}")]
        //ignore-sync
        public async Task<DataResponse<List<TaiLieuDinhKem>>> GetByItemId([FromRoute] Guid itemId, string type)
        {
            var tailieus = await _taiLieuDinhKemService.GetByItemId(itemId, type);
            if (tailieus != null)
            {
                return DataResponse<List<TaiLieuDinhKem>>.Success(tailieus);
            }
            return DataResponse<List<TaiLieuDinhKem>>.False("Không tìm thấy tài liệu đính kèm");
        }

        [HttpPost("UpdateFileItem")]
        //ignore-sync
        public async Task<DataResponse<string>> UpdateFileItem([FromBody] UpdateItemIdRequest model)
        {
            var tl = await _taiLieuDinhKemService.UpdateItemIdAsync(model.ItemId, model.FileIds);

            return DataResponse<string>.Success("Cập nhật tài liệu thành công");
        }

        [HttpGet("GetPathFileById/{itemId}")]
        public async Task<DataResponse<string>> GetPathFileById(Guid id)
        {
            var path = await _taiLieuDinhKemService.GetPathFromId(id);
            if (path != null)
            {
                return DataResponse<string>.Success(path);
            }
            return DataResponse<string>.False("Không tìm thấy tài liệu đính kèm");
        }

        [HttpGet("GetById/{id}")]
        public async Task<DataResponse<TaiLieuDinhKem>> GetById(Guid id)
        {
            var entity = await _taiLieuDinhKemService.GetById(id);
            if (entity != null)
            {
                return DataResponse<TaiLieuDinhKem>.Success(entity);
            }
            return DataResponse<TaiLieuDinhKem>.False("Không tìm thấy tài liệu đính kèm");
        }


        [HttpGet("GetDanhSachTaiLieu")]
        public async Task<DataResponse<List<DanhSachTaiLieuDto>>> GetDanhSachRutGon(string? keyword, string? loaiTaiLieu)
        {
            try
            {
                var result = await _taiLieuDinhKemService.GetDanhSachTaiLieu(keyword, loaiTaiLieu);

                return DataResponse<List<DanhSachTaiLieuDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return DataResponse<List<DanhSachTaiLieuDto>>.False("Lỗi khi lấy danh sách tài liệu: " + ex.Message);
            }
        }
    }
}
