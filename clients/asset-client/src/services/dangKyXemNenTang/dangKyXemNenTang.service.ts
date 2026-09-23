import { DangKyXemNenTangType } from "@/types/dang-ky-xem-nen-tang/dto";
import { DangKyXemNenTangSearchType, DangKyXemNenTangRequestType } from "@/types/dang-ky-xem-nen-tang/request";
import { ApiResponse, DropdownOption, PagedList } from "@/types/general";
import { apiService } from "../index";

class DangKyXemNenTangService {
  private static _instance: DangKyXemNenTangService;

  public static get instance(): DangKyXemNenTangService {
    if (!DangKyXemNenTangService._instance) {
      DangKyXemNenTangService._instance = new DangKyXemNenTangService();
    }
    return DangKyXemNenTangService._instance;
  }

  public async create(
    model: DangKyXemNenTangRequestType
  ): Promise<ApiResponse<DangKyXemNenTangType>> {
    try {
      const response = await apiService.post<DangKyXemNenTangType>(
        `/DangKyXemNenTang/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: DangKyXemNenTangRequestType
  ): Promise<ApiResponse<DangKyXemNenTangType>> {
    try {
      const response = await apiService.put<DangKyXemNenTangType>(
        `/DangKyXemNenTang/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<DangKyXemNenTangType>> {
    try {
      const response = await apiService.get<DangKyXemNenTangType>(
        `/DangKyXemNenTang/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: DangKyXemNenTangSearchType
  ): Promise<ApiResponse<PagedList<DangKyXemNenTangType>>> {
    try {
      const response = await apiService.post<PagedList<DangKyXemNenTangType>>(
        `/DangKyXemNenTang/GetData`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async delete(
    id: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.delete(
        `/DangKyXemNenTang/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdownPlatform(query?: string): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/DangKyXemNenTang/GetDropdownPlatform${query ? `?query=${encodeURIComponent(query)}` : ""}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

const dangKyXemNenTangService = DangKyXemNenTangService.instance;
export default dangKyXemNenTangService;
