import { ApiResponse, PagedList } from "@/types/general";
import { RutTienKyQuySearchType, RutTienKyQuyType } from "@/types/rutTienKyQuy/dto";
import {
  RutTienKyQuySaveRequestType,
} from "@/types/rutTienKyQuy/request";
import { apiService } from "../index";

class RutTienKyQuyService {
  private static _instance: RutTienKyQuyService;
  public static get instance(): RutTienKyQuyService {
    if (!RutTienKyQuyService._instance) {
      RutTienKyQuyService._instance = new RutTienKyQuyService();
    }
    return RutTienKyQuyService._instance;
  }

  public async getData(
    search: RutTienKyQuySearchType,
  ): Promise<ApiResponse<PagedList<RutTienKyQuyType>>> {
    return apiService.post<PagedList<RutTienKyQuyType>>(
      `/RutTienKyQuy/GetData`,
      search,
    );
  }

  public async getStatusCounts(
    search: RutTienKyQuySearchType,
  ): Promise<ApiResponse<{ [key: number]: number }>> {
    return apiService.post<{ [key: number]: number }>(
      `/RutTienKyQuy/GetStatusCounts`,
      search,
    );
  }

  public async get(id: string): Promise<ApiResponse<RutTienKyQuyType>> {
    return apiService.get<RutTienKyQuyType>(`/RutTienKyQuy/Get/${id}`);
  }

  public async create(
    payload: RutTienKyQuySaveRequestType,
  ): Promise<ApiResponse> {
    return apiService.post(`/RutTienKyQuy/Create`, payload);
  }

  public async update(
    payload: RutTienKyQuySaveRequestType,
  ): Promise<ApiResponse> {
    return apiService.put(`/RutTienKyQuy/Update`, payload);
  }

  public async delete(id: string): Promise<ApiResponse> {
    return apiService.delete(`/RutTienKyQuy/Delete/${id}`);
  }

  public async transition(
    ids: string[],
    targetStatus: number,
    note?: string,
  ): Promise<ApiResponse<boolean>> {
    return apiService.post<boolean>(`/RutTienKyQuy/Transition`, {
      ids,
      targetStatus,
      note,
    });
  }

  public async assign(
    id: string,
    specialistId: string,
    specialistName: string,
  ): Promise<ApiResponse<boolean>> {
    return apiService.post<boolean>(`/RutTienKyQuy/Assign`, {
      id,
      specialistId,
      specialistName,
    });
  }

  public async selfAssign(id: string): Promise<ApiResponse<boolean>> {
    return apiService.post<boolean>(`/RutTienKyQuy/SelfAssign/${id}`);
  }

  public async getSpecialists(): Promise<
    ApiResponse<
      Array<{
        id: string;
        name: string;
        userName: string;
      }>
    >
  > {
    return apiService.get(`/RutTienKyQuy/GetSpecialists`);
  }

  public async getListRawData(payload: any): Promise<ApiResponse<any[]>> {
    return apiService.post<any[]>(`/RutTienKyQuy/GetListRawData`, payload);
  }

  public async sign(payload: any): Promise<ApiResponse<any>> {
    return apiService.post<any>(`/RutTienKyQuy/Sign`, payload);
  }

  public async getSignature(id: string): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>(`/RutTienKyQuy/GetSignature/${id}`);
  }
}

const rutTienKyQuyService = RutTienKyQuyService.instance;
export default rutTienKyQuyService;
