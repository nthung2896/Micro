using Hinet.Api.Dto;
using Hinet.Controllers;
using Hinet.Extensions;
using Hinet.Model.Entities;
using Hinet.Service.Common;
using Hinet.Service.Common.Service;
using Hinet.Service.Constant;
using Hinet.Service.Core.Mapper;
using Hinet.Service.TaiLieuDinhKemService;
using Hinet.Service.TaiLieuDinhKemService.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace Hinet.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommonController : HinetController
    {
        private readonly ILogger<CommonController> _logger;
        private readonly IMapper _mapper;
        private readonly ITaiLieuDinhKemService _taiLieuDinhKemService;
        private readonly Hinet.Service.MinioService.IMinioService _minioService;

        public CommonController(
            ITaiLieuDinhKemService taiLieuDinhKemService,
            IMapper mapper,
            ILogger<CommonController> logger,
            Hinet.Service.MinioService.IMinioService minioService)
        {
            _logger = logger;
            _taiLieuDinhKemService = taiLieuDinhKemService;
            _mapper = mapper;
            _minioService = minioService;
        }

        //CreatedBy:TruongTD
        [HttpPost("upload")]
        //ignore-sync
        public async Task<DataResponse<List<TaiLieuDinhKem>>> UploadFile([FromForm] UploadFileDto form)
        {
            var result = new List<TaiLieuDinhKem>();
            if (form.Files == null || form.Files.Count == 0)
            {
                throw new Exception("Không có file nào được chọn");
            }

            foreach (var file in form.Files)
            {
                // Kiểm tra file rỗng
                if (file == null || file.Length == 0)
                {
                    return DataResponse<List<TaiLieuDinhKem>>.False("Uploaded file is empty ", ModelStateError);
                }

                // Kiểm tra loại file
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                if (!AppSettings.FileSetting.AllowExtensions.Contains(fileExtension))
                {
                    return DataResponse<List<TaiLieuDinhKem>>
                        .False(
                            $"Uploaded file extension must be {string.Join(",", AppSettings.FileSetting.AllowExtensions)}",
                            ModelStateError);
                }

                //kiểm tra dung lượng file
                if (file.Length > AppSettings.FileSetting.MaxSize)
                {
                    return DataResponse<List<TaiLieuDinhKem>>
                        .False($"Uploaded file sized must less than or equal to  {AppSettings.FileSetting.MaxSize}",
                            ModelStateError);
                }

                var safeFolder = string.IsNullOrWhiteSpace(form.FileType) ? "files" : form.FileType;
                var id = Guid.NewGuid();
                var customFileName = $"{id}_{Path.GetFileName(file.FileName)}";
                var filePath = await _minioService.UploadFileAsync(file, safeFolder, customFileName);
                Guid? itemId = null;

                if (string.IsNullOrEmpty(filePath))
                {
                    throw new Exception("Failed to upload file");
                }

                var newTaiLieu = new TaiLieuDinhKem
                {
                    Id = id,
                    KichThuoc = file.Length / 1024,
                    TenTaiLieu = file.FileName,
                    LoaiTaiLieu = safeFolder,
                    ItemId = itemId,
                    DuongDanFile = filePath,
                    Extension = fileExtension,
                    DuongDanFilePDF = "N/A",
                };
                try
                {
                    await _taiLieuDinhKemService.CreateAsync(newTaiLieu);
                    result.Add(newTaiLieu);
                }
                catch (Exception e)
                {
                    return DataResponse<List<TaiLieuDinhKem>>
                        .False(
                            "Lỗi khi lưu tài liệu đính kèm: " + e.Message,
                            ModelStateError);
                }
            }

            return DataResponse<List<TaiLieuDinhKem>>.Success(result);
        }

        [HttpPost("uploadPublish")]
        public async Task<DataResponse<List<TaiLieuDinhKem>>> UploadFilePublish([FromForm] UploadFileDto form)
        {
            return await UploadFile(form);
        }


        [HttpPost("upload-multiple")]
        //ignore-sync
        public async Task<DataResponse<List<TaiLieuDinhKem>>>
            UploadMultipleFiles([FromForm] List<UploadFileDto> forms) // Quan trọng: Thêm [FromForm]
        {
            var result = new List<TaiLieuDinhKem>();
            var errorMessages = new List<string>();

            if (forms == null || forms.Count == 0)
            {
                return DataResponse<List<TaiLieuDinhKem>>.False("Không có dữ liệu upload.", ModelStateError);
            }

            foreach (var form in forms) // 'form' là một UploadFileDto
            {
                if (form.Files == null || !form.Files.Any())
                {
                    _logger.LogWarning(
                        $"UploadFileDto không có file nào được cung cấp. FileType: {form.FileType}, MoTa: {form.MoTa}");
                    continue;
                }

                foreach (var file in form.Files) // 'file' là một IFormFile
                {
                    if (file == null || file.Length == 0)
                    {
                        _logger.LogWarning($"Một file rỗng đã được gửi trong form. FileType: {form.FileType}");
                        errorMessages.Add($"Một file rỗng đã được gửi kèm mô tả: {form.MoTa ?? "Không có mô tả"}.");
                        continue;
                    }

                    var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!AppSettings.FileSetting.AllowExtensions.Contains(fileExtension))
                    {
                        _logger.LogWarning(
                            $"File không hợp lệ: {file.FileName}, định dạng: {fileExtension}. FileType: {form.FileType}");
                        errorMessages.Add($"File '{file.FileName}' có định dạng không được phép ({fileExtension}).");
                        continue;
                    }

                    if (file.Length > AppSettings.FileSetting.MaxSize)
                    {
                        _logger.LogWarning(
                            $"File quá lớn: {file.FileName}, kích thước: {file.Length}. FileType: {form.FileType}");
                        errorMessages.Add(
                            $"File '{file.FileName}' vượt quá kích thước cho phép ({AppSettings.FileSetting.MaxSize / (1024 * 1024)}MB).");
                        continue;
                    }

                    var safeFolder = string.IsNullOrWhiteSpace(form.FileType) ? "files" : form.FileType;
                    var id = Guid.NewGuid();
                    var customFileName = $"{id}_{Path.GetFileName(file.FileName)}";
                    var filePath = await _minioService.UploadFileAsync(file, safeFolder, customFileName);
                    Guid? itemId = null;

                    if (string.IsNullOrEmpty(filePath))
                    {
                        _logger.LogError($"Không thể upload file: {file.FileName} cho FileType: {form.FileType}");
                        errorMessages.Add($"Không thể upload file '{file.FileName}'.");
                        continue;
                    }

                    var newTaiLieu = new TaiLieuDinhKem
                    {
                        Id = id,
                        KichThuoc = file.Length / 1024,
                        TenTaiLieu = file.FileName,
                        LoaiTaiLieu = safeFolder,
                        ItemId = itemId,
                        DuongDanFile = filePath,
                        Extension = fileExtension,
                        DuongDanFilePDF = "N/A",
                    };
                    result.Add(newTaiLieu);
                }
            }

            if (!result.Any() && errorMessages.Any()) // Không có file nào thành công và có lỗi
            {
                return DataResponse<List<TaiLieuDinhKem>>.False(
                    "Không có file nào được xử lý thành công. Lỗi: " + string.Join("; ", errorMessages),
                    ModelStateError);
            }

            if (!result.Any() &&
                !errorMessages.Any()) // Không có file nào được gửi hoặc tất cả đều bị skip mà không lỗi
            {
                return DataResponse<List<TaiLieuDinhKem>>.Success(new List<TaiLieuDinhKem>(),
                    "Không có file nào hợp lệ để xử lý hoặc không có file nào được gửi.");
            }


            try
            {
                await _taiLieuDinhKemService.CreateAsync(result); // Lưu danh sách các tài liệu đã xử lý thành công
            }
            catch (Exception ex) // Bắt Exception cụ thể nếu có thể
            {
                _logger.LogError(ex, "Lỗi khi lưu nhiều tài liệu đính kèm vào CSDL.");
                // Nếu việc lưu vào DB thất bại, cần thông báo lỗi và có thể client cần thử lại
                // hoặc thông báo cho người dùng rằng một số file đã upload nhưng chưa được lưu.
                // Trả về lỗi kèm theo các file đã được xử lý nhưng chưa lưu có thể hữu ích.
                return DataResponse<List<TaiLieuDinhKem>>.False(
                    "Lỗi nghiêm trọng khi lưu tài liệu đính kèm vào cơ sở dữ liệu. " + string.Join("; ", errorMessages),
                    ModelStateError);
            }

            string successMessage = $"Đã xử lý thành công {result.Count} file.";
            if (errorMessages.Any())
            {
                successMessage += " Một số file không thể xử lý: " + string.Join("; ", errorMessages);
            }

            return DataResponse<List<TaiLieuDinhKem>>.Success(result, successMessage);
        }

        //Xoá file temp dựa theo path
        [HttpPost("deleteTempFile")]
        public IActionResult DeleteTempFile(DeleteFileRequest request)
        {
            try
            {
                UploadFileHelper.RemoveFile(request.UploadedUrl);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(DataResponse<List<Guid>>.False("An error occurs when removing file",
                    ModelStateError));
            }
        }

        //Delete file by path
        [HttpGet("deleteFileByPath")]
        public Task<DataResponse> DeleteFileByPath(string filePath)
        {
            UploadFileHelper.RemoveFile(filePath);
            return Task.FromResult(DataResponse.Success(null));
        }

        [HttpPost("removeFile")]
        public async Task<IActionResult> RemoveFiles(List<Guid> form)
        {
            try
            {
                foreach (var id in form)
                {
                    var existingFile = await _taiLieuDinhKemService.GetByIdAsync(id);
                    if (existingFile == null)
                    {
                        return BadRequest(DataResponse<List<Guid>>.False($"No attachment match to {id}",
                            ModelStateError));
                    }

                    if (await _minioService.FileExistsAsync(existingFile.DuongDanFile))
                    {
                        await _minioService.DeleteFileAsync(existingFile.DuongDanFile);
                    }
                    else
                    {
                        UploadFileHelper.RemoveFile(existingFile.DuongDanFile);
                    }

                    await _taiLieuDinhKemService.DeleteAsync(existingFile);
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(DataResponse<List<Guid>>.False("An error occurs when removing file",
                    ModelStateError));
            }
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> Download([FromRoute] Guid id)
        {
            try
            {
                var entity = await _taiLieuDinhKemService.GetByIdAsync(id);
                if (entity == null) return NotFound(DataResponse.False("Không tìm thấy tệp"));

                if (await _minioService.FileExistsAsync(entity.DuongDanFile))
                {
                    var stream = await _minioService.GetFileStreamAsync(entity.DuongDanFile);
                    var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
                    var contentType = provider.TryGetContentType(entity.TenTaiLieu, out var ct) ? ct : "application/octet-stream";
                    return File(stream, contentType, entity.TenTaiLieu);
                }

                var downloadData = UploadFileHelper.GetDownloadData(entity.DuongDanFile);
                var fallbackContentType = "application/octet-stream";
                return File(downloadData.FileBytes, fallbackContentType, downloadData.FileName);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, DataResponse.False(ex.Message));
            }
        }

        [HttpGet("GetLstUploadsFile")]
        public async Task<DataResponse<List<TaiLieuDinhKem>>> GetLstUploadsFile([FromQuery] Guid Itemid)
        {
            var lstUploads = await _taiLieuDinhKemService.GetByItemAsync(Itemid);
            return DataResponse<List<TaiLieuDinhKem>>.Success(lstUploads, "Get Uplpoads success");
        }
    }

    public class DeleteFileRequest
    {
        public string? UploadedUrl { get; set; }
    }
}