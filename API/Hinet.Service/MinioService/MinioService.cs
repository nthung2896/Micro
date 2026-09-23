using Hinet.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Minio;
using Minio.DataModel.Args;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Hinet.Service.MinioService
{
    public class MinioService : IMinioService
    {
        private readonly ILogger<MinioService> _logger;

        public MinioService(ILogger<MinioService> logger)
        {
            _logger = logger;
        }

        private IMinioClient CreateClient()
        {
            var minioSetting = AppSettings.Minio;
            if (minioSetting == null || string.IsNullOrWhiteSpace(minioSetting.Endpoint))
            {
                throw new InvalidOperationException("Minio configuration is missing or invalid in appsettings.json.");
            }

            var endpoint = minioSetting.Endpoint.Replace("http://", "").Replace("https://", "").TrimEnd('/');

            var builder = new MinioClient()
                .WithEndpoint(endpoint)
                .WithCredentials(minioSetting.AccessKey, minioSetting.SecretKey);

            if (minioSetting.Secure)
            {
                builder = builder.WithSSL();
            }

            return builder.Build();
        }

        private string GetDefaultBucketName(string? bucketName = null)
        {
            var name = !string.IsNullOrWhiteSpace(bucketName) ? bucketName : AppSettings.Minio?.BucketName;
            if (string.IsNullOrWhiteSpace(name))
            {
                name = "kpi-btc-uploads";
            }
            return name.ToLowerInvariant();
        }

        public async Task<bool> EnsureBucketExistsAsync(string? bucketName = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var bucket = GetDefaultBucketName(bucketName);
                var client = CreateClient();

                var existsArgs = new BucketExistsArgs().WithBucket(bucket);
                bool exists = await client.BucketExistsAsync(existsArgs, cancellationToken);
                if (!exists)
                {
                    var makeArgs = new MakeBucketArgs().WithBucket(bucket);
                    await client.MakeBucketAsync(makeArgs, cancellationToken);
                    _logger.LogInformation("Successfully created MinIO bucket '{BucketName}'", bucket);
                }
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking/creating MinIO bucket");
                return false;
            }
        }

        public async Task<string> UploadFileAsync(IFormFile file, string? folderPath = null, string? customFileName = null, CancellationToken cancellationToken = default)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("File is empty or null.", nameof(file));
            }

            var extension = Path.GetExtension(file.FileName);
            var fileName = !string.IsNullOrWhiteSpace(customFileName)
                ? (customFileName.EndsWith(extension, StringComparison.OrdinalIgnoreCase) ? customFileName : customFileName + extension)
                : $"{Guid.NewGuid()}{extension}";

            var datePrefix = DateTime.Now.ToString("yyyyMMdd");
            var objectName = string.IsNullOrWhiteSpace(folderPath)
                ? $"{datePrefix}/{fileName}"
                : $"{folderPath.Trim('/')}/{datePrefix}/{fileName}";

            using var stream = file.OpenReadStream();
            return await UploadStreamAsync(stream, objectName, file.ContentType ?? "application/octet-stream", file.Length, cancellationToken);
        }

        public async Task<string> UploadStreamAsync(Stream stream, string objectName, string contentType, long size = -1, CancellationToken cancellationToken = default)
        {
            if (stream == null) throw new ArgumentNullException(nameof(stream));
            if (string.IsNullOrWhiteSpace(objectName)) throw new ArgumentException("Object name is required.", nameof(objectName));

            await EnsureBucketExistsAsync(cancellationToken: cancellationToken);

            var client = CreateClient();
            var bucket = GetDefaultBucketName();

            var objectSize = size >= 0 ? size : (stream.CanSeek ? stream.Length : -1);

            var putArgs = new PutObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(objectSize)
                .WithContentType(string.IsNullOrWhiteSpace(contentType) ? "application/octet-stream" : contentType);

            await client.PutObjectAsync(putArgs, cancellationToken);
            _logger.LogInformation("Uploaded object '{ObjectName}' to MinIO bucket '{Bucket}'", objectName, bucket);

            return objectName;
        }

        public async Task<string> UploadBytesAsync(byte[] data, string objectName, string contentType, CancellationToken cancellationToken = default)
        {
            if (data == null || data.Length == 0) throw new ArgumentException("Data is empty.", nameof(data));

            using var ms = new MemoryStream(data);
            return await UploadStreamAsync(ms, objectName, contentType, data.Length, cancellationToken);
        }

        public async Task<Stream> GetFileStreamAsync(string objectName, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(objectName)) throw new ArgumentException("Object name is required.", nameof(objectName));

            var client = CreateClient();
            var bucket = GetDefaultBucketName();

            var memoryStream = new MemoryStream();

            var getArgs = new GetObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectName)
                .WithCallbackStream((stream) =>
                {
                    stream.CopyTo(memoryStream);
                });

            await client.GetObjectAsync(getArgs, cancellationToken);
            memoryStream.Position = 0;
            return memoryStream;
        }

        public async Task<byte[]> GetFileBytesAsync(string objectName, CancellationToken cancellationToken = default)
        {
            using var stream = await GetFileStreamAsync(objectName, cancellationToken);
            using var ms = new MemoryStream();
            await stream.CopyToAsync(ms, cancellationToken);
            return ms.ToArray();
        }

        public async Task<bool> DeleteFileAsync(string objectName, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(objectName)) return false;

            try
            {
                var client = CreateClient();
                var bucket = GetDefaultBucketName();

                var removeArgs = new RemoveObjectArgs()
                    .WithBucket(bucket)
                    .WithObject(objectName);

                await client.RemoveObjectAsync(removeArgs, cancellationToken);
                _logger.LogInformation("Deleted object '{ObjectName}' from MinIO bucket '{Bucket}'", objectName, bucket);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting object '{ObjectName}' from MinIO", objectName);
                return false;
            }
        }

        public async Task<bool> FileExistsAsync(string objectName, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(objectName)) return false;

            try
            {
                var client = CreateClient();
                var bucket = GetDefaultBucketName();

                var statArgs = new StatObjectArgs()
                    .WithBucket(bucket)
                    .WithObject(objectName);

                await client.StatObjectAsync(statArgs, cancellationToken);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<string> GetPresignedUrlAsync(string objectName, int expiryInSeconds = 3600, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(objectName)) return string.Empty;

            var client = CreateClient();
            var bucket = GetDefaultBucketName();

            var presignedArgs = new PresignedGetObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectName)
                .WithExpiry(expiryInSeconds);

            return await client.PresignedGetObjectAsync(presignedArgs);
        }
    }
}
