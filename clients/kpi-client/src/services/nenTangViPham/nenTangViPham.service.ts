import { NenTangViPhamType } from "@/types/nen-tang-vi-pham/dto";
import { NenTangViPhamRequestType, NenTangViPhamSearchType } from "@/types/nen-tang-vi-pham/request";
import { ApiResponse, Dictionary, DropdownOption, PagedList } from "@/types/general";
import { apiService } from "../index";

class NenTangViPhamService {
  private static _instance: NenTangViPhamService;

  public static get instance(): NenTangViPhamService {
    if (!NenTangViPhamService._instance) {
      NenTangViPhamService._instance = new NenTangViPhamService();
    }
    return NenTangViPhamService._instance;
  }

  public async create(
    model: NenTangViPhamRequestType
  ): Promise<ApiResponse<NenTangViPhamType>> {
    try {
      const response = await apiService.post<NenTangViPhamType>(
        `/NenTangViPham/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: NenTangViPhamRequestType
  ): Promise<ApiResponse<NenTangViPhamType>> {
    try {
      const response = await apiService.put<NenTangViPhamType>(
        `/NenTangViPham/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<NenTangViPhamType>> {
    try {
      const response = await apiService.get<NenTangViPhamType>(
        `/NenTangViPham/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: NenTangViPhamSearchType
  ): Promise<ApiResponse<PagedList<NenTangViPhamType>>> {
    try {
      const response = await apiService.post<PagedList<NenTangViPhamType>>(
        `/NenTangViPham/GetData`,
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
        `/NenTangViPham/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdowns(): Promise<ApiResponse<Dictionary<DropdownOption[]>>> {
    try {
      const response = await apiService.get<Dictionary<DropdownOption[]>>(`/NenTangViPham/GetDropdowns`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const nenTangViPhamService = NenTangViPhamService.instance;
export default nenTangViPhamService;
