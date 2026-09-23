import { ApiResponse } from "@/types/general";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import { apiService } from "../index";
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
class UploadFileService {
  public async deleteFilesById(
    fileId: string[],
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response = await apiService.post<TaiLieuDinhKemType[]>(
        "/Common/removeFile",
        fileId,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async upload(
    form: FormData,
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response = await apiService.post<TaiLieuDinhKemType[]>(
        "/common/upload",
        form,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async uploadPublish(
    form: FormData,
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response = await apiService.post<TaiLieuDinhKemType[]>(
        "/common/uploadPublish",
        form,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async uploadMultiFile(
    form: FormData,
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response = await apiService.post<TaiLieuDinhKemType[]>(
        "/common/upload-multiple",
        form,
        {
          headers: {
            // Không cần thiết lập Content-Type khi gửi FormData
            // Browser sẽ tự động thêm boundary cho multipart/form-data
          },
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async deleteTemp(
    uploadedUrl: string,
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response = await apiService.post<TaiLieuDinhKemType[]>(
        "/common/deleteTempFile",
        {
          uploadedUrl,
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getImage(filePath: string) {
    try {
      const response = await fetch(`${baseUrl}/common/${filePath}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getPdfPath(filePath: string) {
    try {
      const response = await apiService.get<ApiResponse<string>>(
        "/common/getPdfPath?filePath=" + filePath,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async deleteFileByPath(filePath: string) {
    try {
      const response = await apiService.get<ApiResponse<string>>(
        "/common/deleteFileByPath?filePath=" + filePath,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getFilesByRecord(
    Itemid: string,
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response = await apiService.get<TaiLieuDinhKemType[]>(
        `/common/GetLstUploadsFile?Itemid=${Itemid}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const uploadFileService = new UploadFileService();
