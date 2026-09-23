using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Hinet.Service.MinioService
{
    public interface IMinioService
    {
        /// <summary>
        /// Kiểm tra và tự động tạo Bucket nếu chưa tồn tại
        /// </summary>
        Task<bool> EnsureBucketExistsAsync(string? bucketName = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Tải lên một file từ IFormFile vào MinIO, trả về objectName (đường dẫn tương đối trong bucket)
        /// </summary>
        Task<string> UploadFileAsync(IFormFile file, string? folderPath = null, string? customFileName = null, CancellationToken cancellationToken = default);

        /// <summary>
        /// Tải lên dữ liệu dạng Stream vào MinIO
        /// </summary>
        Task<string> UploadStreamAsync(Stream stream, string objectName, string contentType, long size = -1, CancellationToken cancellationToken = default);

        /// <summary>
        /// Tải lên dữ liệu dạng mảng byte[] vào MinIO
        /// </summary>
        Task<string> UploadBytesAsync(byte[] data, string objectName, string contentType, CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy Stream của file từ MinIO theo objectName
        /// </summary>
        Task<Stream> GetFileStreamAsync(string objectName, CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy mảng byte[] của file từ MinIO theo objectName
        /// </summary>
        Task<byte[]> GetFileBytesAsync(string objectName, CancellationToken cancellationToken = default);

        /// <summary>
        /// Xóa file khỏi MinIO theo objectName
        /// </summary>
        Task<bool> DeleteFileAsync(string objectName, CancellationToken cancellationToken = default);

        /// <summary>
        /// Kiểm tra xem file có tồn tại trên MinIO không
        /// </summary>
        Task<bool> FileExistsAsync(string objectName, CancellationToken cancellationToken = default);

        /// <summary>
        /// Tạo URL tạm thời (Presigned URL) có thời hạn để xem/tải file trực tiếp
        /// </summary>
        Task<string> GetPresignedUrlAsync(string objectName, int expiryInSeconds = 3600, CancellationToken cancellationToken = default);
    }
}
