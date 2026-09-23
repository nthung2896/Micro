import { ApiResponse, PagedList } from "@/types/general";
import { CompanyInfoType } from "@/types/companyInfo/dto";
import {
  CompanyInfoSearchType,
  CompanyInfoUpdateStatusRequestType,
} from "@/types/companyInfo/request";
import { apiService } from "../index";

class CompanyInfoService {
  private static _instance: CompanyInfoService;
  public static get instance(): CompanyInfoService {
    if (!CompanyInfoService._instance) {
      CompanyInfoService._instance = new CompanyInfoService();
    }
    return CompanyInfoService._instance;
  }

  public async getData(
    search: CompanyInfoSearchType,
  ): Promise<ApiResponse<PagedList<CompanyInfoType>>> {
    return apiService.post<PagedList<CompanyInfoType>>(
      `/CompanyInfo/GetData`,
      search,
    );
  }

  public async get(id: string): Promise<ApiResponse<CompanyInfoType>> {
    return apiService.get<CompanyInfoType>(`/CompanyInfo/Get/${id}`);
  }

  public async getByCurrentUser(): Promise<ApiResponse<CompanyInfoType>> {
    return apiService.get<CompanyInfoType>(`/CompanyInfo/GetByCurrentUser`);
  }

  public async updateStatus(
    payload: CompanyInfoUpdateStatusRequestType,
  ): Promise<ApiResponse> {
    return apiService.put(`/CompanyInfo/UpdateStatus`, payload);
  }

  public async delete(id: string): Promise<ApiResponse> {
    return apiService.delete(`/CompanyInfo/Delete/${id}`);
  }

  public async getTraCuu(taxCode: string): Promise<ApiResponse<any>> {
    return apiService.get<any>(`/CompanyInfo/GetTraCuu`, {
      params: { taxCode },
    });
  }
}

const companyInfoService = CompanyInfoService.instance;
export default companyInfoService;
