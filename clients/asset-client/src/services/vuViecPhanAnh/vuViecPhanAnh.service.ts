import {
  VuViecPhanAnhType,
} from "@/types/vu-viec-phan-anh/dto";
import {
  VuViecPhanAnhRequestType,
  VuViecPhanAnhSearchType,
} from "@/types/vu-viec-phan-anh/request";
import { ApiResponse, Dictionary, DropdownOption, PagedList } from "@/types/general";
import { apiService } from "../index";

class VuViecPhanAnhService {
  private static _instance: VuViecPhanAnhService;

  public static get instance(): VuViecPhanAnhService {
    if (!VuViecPhanAnhService._instance) {
      VuViecPhanAnhService._instance = new VuViecPhanAnhService();
    }
    return VuViecPhanAnhService._instance;
  }

  public async create(
    model: VuViecPhanAnhRequestType
  ): Promise<ApiResponse<VuViecPhanAnhType>> {
    try {
      const response = await apiService.post<VuViecPhanAnhType>(
        `/VuViecPhanAnh/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: VuViecPhanAnhRequestType
  ): Promise<ApiResponse<VuViecPhanAnhType>> {
    try {
      const response = await apiService.put<VuViecPhanAnhType>(
        `/VuViecPhanAnh/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async changeStatus(
    id: string,
    trangThai: number,
    ketLuan?: number
  ): Promise<ApiResponse<VuViecPhanAnhType>> {
    try {
      const response = await apiService.put<VuViecPhanAnhType>(
        `/VuViecPhanAnh/ChangeStatus`,
        { id, trangThai, ketLuan }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<VuViecPhanAnhType>> {
    try {
      const response = await apiService.get<VuViecPhanAnhType>(
        `/VuViecPhanAnh/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: VuViecPhanAnhSearchType
  ): Promise<ApiResponse<PagedList<VuViecPhanAnhType>>> {
    try {
      const response = await apiService.post<PagedList<VuViecPhanAnhType>>(
        `/VuViecPhanAnh/GetData`,
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
        `/VuViecPhanAnh/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const vuViecPhanAnhService = VuViecPhanAnhService.instance;
export default vuViecPhanAnhService;
