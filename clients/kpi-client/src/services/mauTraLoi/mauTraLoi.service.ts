import { ApiResponse, PagedList } from "@/types/general";
import { MauTraLoiType } from "@/types/mauTraLoi/dto";
import {
  MauTraLoiSearchType,
  MauTraLoiRequestType,
} from "@/types/mauTraLoi/request";
import { apiService } from "../index";

class MauTraLoiService {
  private static _instance: MauTraLoiService;
  public static get instance(): MauTraLoiService {
    if (!MauTraLoiService._instance) {
      MauTraLoiService._instance = new MauTraLoiService();
    }
    return MauTraLoiService._instance;
  }

  public async getData(
    search: MauTraLoiSearchType,
  ): Promise<ApiResponse<PagedList<MauTraLoiType>>> {
    return apiService.post<PagedList<MauTraLoiType>>(
      `/MauTraLoi/GetData`,
      search,
    );
  }

  public async get(id: string): Promise<ApiResponse<MauTraLoiType>> {
    return apiService.get<MauTraLoiType>(`/MauTraLoi/Get/${id}`);
  }

  public async create(
    payload: MauTraLoiRequestType,
  ): Promise<ApiResponse<any>> {
    return apiService.post(`/MauTraLoi/Create`, payload);
  }

  public async update(
    payload: MauTraLoiRequestType,
  ): Promise<ApiResponse<any>> {
    return apiService.put(`/MauTraLoi/Update`, payload);
  }

  public async delete(id: string): Promise<ApiResponse> {
    return apiService.delete(`/MauTraLoi/Delete/${id}`);
  }

  public async getGroupedTemplates(groupCode?: string): Promise<ApiResponse<any[]>> {
    const url = groupCode 
      ? `/MauTraLoi/GetGroupedTemplates?groupCode=${encodeURIComponent(groupCode)}`
      : `/MauTraLoi/GetGroupedTemplates`;
    return apiService.get<any[]>(url);
  }
}

const mauTraLoiService = MauTraLoiService.instance;
export default mauTraLoiService;
