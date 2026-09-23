import { apiService } from "@/services";
import { ApiResponse } from "@/types/general";

export interface MinioUploadResponse {
  objectName: string;
  fileName: string;
  size: number;
  presignedUrl?: string;
}

class MinioService {
  private static _instance: MinioService;

  public static get instance(): MinioService {
    if (!MinioService._instance) {
      MinioService._instance = new MinioService();
    }
    return MinioService._instance;
  }

  /**
   * Upload file lên MinIO
   * @param file File cần upload
   * @param folderPath Thư mục lưu trữ trên MinIO (tùy chọn)
   */
  public async upload(
    file: File,
    folderPath?: string,
  ): Promise<ApiResponse<MinioUploadResponse>> {
    const formData = new FormData();
    formData.append("file", file, file.name);

    const config = folderPath ? { params: { folderPath } } : undefined;
    const response = await apiService.post<MinioUploadResponse>(
      "/Minio/upload",
      formData,
      config,
    );
    return response;
  }

  /**
   * Lấy Presigned URL xem/tải file từ MinIO
   * @param objectName Tên object trên MinIO
   * @param expiryInSeconds Thời gian hết hạn của link (giây, mặc định 3600)
   */
  public async getPresignedUrl(
    objectName: string,
    expiryInSeconds: number = 3600,
  ): Promise<ApiResponse<string>> {
    const response = await apiService.get<string>("/Minio/presigned-url", {
      params: { objectName, expiryInSeconds },
    });
    return response;
  }

  /**
   * Lấy blob tải file từ MinIO
   * @param objectName Tên object trên MinIO
   */
  public async downloadBlob(
    objectName: string,
    signal?: AbortSignal,
  ): Promise<Blob> {
    return apiService.getBlob("/Minio/download", {
      params: { objectName },
      signal,
    });
  }

  /**
   * Xóa file khỏi MinIO
   * @param objectName Tên object trên MinIO
   */
  public async delete(objectName: string): Promise<ApiResponse<boolean>> {
    const response = await apiService.delete<boolean>("/Minio/delete", {
      params: { objectName },
    });
    return response;
  }

  /**
   * Tạo URL stream xem trực tiếp file từ MinIO
   * @param objectName Tên object hoặc đường dẫn file
   */
  public getViewUrl(objectName?: string | null): string {
    if (!objectName?.trim()) return "";
    const normalized = objectName.trim().replace(/\\/g, "/");
    if (/^https?:\/\//i.test(normalized)) return normalized;

    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    const relative = normalized.replace(/^\//, "").replace(/^uploads\//i, "");
    return `${apiBase}/api/Minio/view/${relative}`;
  }
}

const minioService = MinioService.instance;
export default minioService;
