import { ApiResponse } from "@/types/general";
import TaiLieuDinhKemServiceGenerated from "../generated/taiLieuDinhKemService.generated";
import {
  DanhSachTaiLieuType,
  TaiLieuDinhKemType,
} from "@/types/taiLieuDinhKem/dto";
import { apiService } from "..";
import { FileValidationType } from "@/types/pdf/dto";
import {
  UpdateItemIdRequestType,
  UploadFileRequestType,
} from "@/types/taiLieuDinhKem/request";
const baseURL = process.env.NEXT_PUBLIC_API_URL;

class TaiLieuDinhKemService extends TaiLieuDinhKemServiceGenerated {
  private static _instance: TaiLieuDinhKemService;

  public static get instance(): TaiLieuDinhKemService {
    if (!TaiLieuDinhKemService._instance) {
      TaiLieuDinhKemService._instance = new TaiLieuDinhKemService();
    }
    return TaiLieuDinhKemService._instance;
  }
  public async upload(
    formData: FormData,
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response: ApiResponse<TaiLieuDinhKemType[]> = await apiService.post<
        TaiLieuDinhKemType[]
      >(`/TaiLieuDinhKem/upload`, formData);
      return response;
    } catch (error) {
      throw error;
    }
  }
  public async uploadFile(
    formData: FormData,
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response: ApiResponse<TaiLieuDinhKemType[]> = await apiService.post<
        TaiLieuDinhKemType[]
      >(`/TaiLieuDinhKem/uploadFile`, formData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getById(id: string): Promise<ApiResponse<TaiLieuDinhKemType>> {
    try {
      const response: ApiResponse<TaiLieuDinhKemType> =
        await apiService.get<TaiLieuDinhKemType>(
          `/TaiLieuDinhKem/GetById/${id}`,
        );
      return response;
    } catch (error) {
      throw error;
    }
  }
  public async validateFile(
    id: string,
  ): Promise<ApiResponse<FileValidationType>> {
    try {
      const response: ApiResponse<FileValidationType> = await apiService.post(
        `/TaiLieuDinhKem/ValidateFile/${id}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
  public async updateFileItem(
    data: UpdateItemIdRequestType,
  ): Promise<ApiResponse<FileValidationType>> {
    try {
      const response: ApiResponse<FileValidationType> = await apiService.post(
        `/TaiLieuDinhKem/UpdateFileItem`,
        data,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getByItemId(itemId: string, type?: string) {
    try {
      const config = type
        ? {
            params: { type },
          }
        : undefined;
      const response: ApiResponse<TaiLieuDinhKemType[]> = await apiService.get<
        TaiLieuDinhKemType[]
      >(`/TaiLieuDinhKem/getByItemId/${itemId}`, config);

      return response;
    } catch (error) {
      throw error;
    }
  }

  public async delete(ids: string[] | string) {
    try {
      const idArray: string[] = Array.isArray(ids) ? ids : [ids];

      const response: ApiResponse<TaiLieuDinhKemType[]> =
        await apiService.delete<TaiLieuDinhKemType[]>(
          `/TaiLieuDinhKem/delete`,
          { data: { Ids: idArray } },
        );

      return response;
    } catch (error) {
      throw error;
    }
  }

  public getPreviewBlob(id: string, signal?: AbortSignal): Promise<Blob> {
    return apiService.getBlob(`/TaiLieuDinhKem/${id}/preview`, { signal });
  }

  public getDownloadBlob(id: string, signal?: AbortSignal): Promise<Blob> {
    return apiService.getBlob(`/TaiLieuDinhKem/${id}/download`, { signal });
  }

  public previewTemporary(file: File, signal?: AbortSignal): Promise<Blob> {
    const formData = new FormData();
    formData.append("file", file, file.name);
    return apiService.postBlob(`/TaiLieuDinhKem/preview-temp`, formData, {
      signal,
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  // public getUrl(taiLieu: TaiLieuDinhKemType): string;
  public getUrl(id: string, fileName: string, url: string): string;
  public getUrl(param1: any, param2: any, url: any): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    if (!url) return "";

    let cleanUrl = url.replace(/\\/g, "/").trim();

    const lowerUrl = cleanUrl.toLowerCase();
    if (lowerUrl.startsWith("uploads/")) {
      cleanUrl = `/${cleanUrl}`;
    } else if (!lowerUrl.startsWith("/uploads/")) {
      cleanUrl = cleanUrl.startsWith("/")
        ? `/uploads${cleanUrl}`
        : `/uploads/${cleanUrl}`;
    }

    if (typeof param1 === "object" && param1.id && param1.tenTaiLieu) {
      return `${cleanBaseUrl}${cleanUrl}`;
    }
    if (typeof param1 === "string" && typeof param2 === "string") {
      return `${cleanBaseUrl}${cleanUrl}`;
    }

    throw new Error("Invalid arguments");
  }

  public async uploadAndSaveDbMulti(
    formData: FormData,
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    const response: ApiResponse<TaiLieuDinhKemType[]> = await apiService.post<
      TaiLieuDinhKemType[]
    >(`/TaiLieuDinhKem/uploadAndSaveDb`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  }

  public async getDanhSachTaiLieu(
    keyword?: string,
    loaiTaiLieu?: string,
  ): Promise<ApiResponse<DanhSachTaiLieuType[]>> {
    try {
      const params: any = {};

      if (keyword) params.keyword = keyword;
      if (loaiTaiLieu) params.loaiTaiLieu = loaiTaiLieu;

      const response: ApiResponse<DanhSachTaiLieuType[]> = await apiService.get<
        DanhSachTaiLieuType[]
      >(`/TaiLieuDinhKem/GetDanhSachTaiLieu`, { params });

      return response;
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      throw error;
    }
  }
}

export const buildUploadFormData = (
  requestData: UploadFileRequestType,
): FormData => {
  const formData = new FormData();

  if (requestData.files && requestData.files.length > 0) {
    // Ép kiểu về mảng để lặp nếu files là FileList từ thẻ input HTML
    Array.from(requestData.files as ArrayLike<Blob>).forEach((file) => {
      formData.append("Files", file);
    });
  }

  // 2. Append các thông tin metadata khác
  if (requestData.fileType) {
    formData.append("FileType", requestData.fileType);
  }

  if (requestData.itemId) {
    formData.append("ItemId", requestData.itemId);
  }

  if (requestData.isTemp !== undefined) {
    formData.append("IsTemp", String(requestData.isTemp)); // Nối chuỗi 'true' / 'false'
  }

  return formData;
};

const taiLieuDinhKemService = TaiLieuDinhKemService.instance;
export default taiLieuDinhKemService;
