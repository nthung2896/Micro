import {
  PhanAnhNenTangType,
} from "@/types/phan-anh-nen-tang/dto";
import {
  PhanAnhNenTangRequestType,
  PhanAnhNenTangSearchType,
} from "@/types/phan-anh-nen-tang/request";
import { ApiResponse, Dictionary, DropdownOption, PagedList } from "@/types/general";
import { apiService } from "../index";

class PhanAnhNenTangService {
  private static _instance: PhanAnhNenTangService;

  public static get instance(): PhanAnhNenTangService {
    if (!PhanAnhNenTangService._instance) {
      PhanAnhNenTangService._instance = new PhanAnhNenTangService();
    }
    return PhanAnhNenTangService._instance;
  }

  public async create(
    model: PhanAnhNenTangRequestType
  ): Promise<ApiResponse<PhanAnhNenTangType>> {
    try {
      const response = await apiService.post<PhanAnhNenTangType>(
        `/PhanAnhNenTang/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: PhanAnhNenTangRequestType
  ): Promise<ApiResponse<PhanAnhNenTangType>> {
    try {
      const response = await apiService.put<PhanAnhNenTangType>(
        `/PhanAnhNenTang/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<PhanAnhNenTangType>> {
    try {
      const response = await apiService.get<PhanAnhNenTangType>(
        `/PhanAnhNenTang/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: PhanAnhNenTangSearchType
  ): Promise<ApiResponse<PagedList<PhanAnhNenTangType>>> {
    try {
      const response = await apiService.post<PagedList<PhanAnhNenTangType>>(
        `/PhanAnhNenTang/GetData`,
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
        `/PhanAnhNenTang/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
  public async getDropdowns(): Promise<ApiResponse<Dictionary<DropdownOption[]>>> {
    try {
      const response = await apiService.get<Dictionary<DropdownOption[]>>(`/PhanAnhNenTang/GetDropdowns`);
      return response;
    } catch (error) {
      throw error;
    }
  }
  public async getCaptcha(): Promise<ApiResponse<{ captchaId: string; captchaSvg: string }>> {
    try {
      const response = await apiService.get<{ captchaId: string; captchaSvg: string }>(
        `/PhanAnhNenTang/GetCaptcha`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const phanAnhNenTangService = PhanAnhNenTangService.instance;
export default phanAnhNenTangService;
