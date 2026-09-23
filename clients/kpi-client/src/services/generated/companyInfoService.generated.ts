import {
  CompanyInfoType,
} from "@/types/companyInfo/dto";
import {
  CompanyInfoSearchType,
  CompanyInfoUpdateStatusRequestType,
} from "@/types/companyInfo/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class CompanyInfoServiceGenerated {
  public async getData(
    search: CompanyInfoSearchType
  ): Promise<ApiResponse<PagedList<CompanyInfoType>>> {
    try {
      const response = await apiService.post<PagedList<CompanyInfoType>>(
        `/CompanyInfo/GetData`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<CompanyInfoType>> {
    try {
      const response = await apiService.get<CompanyInfoType>(
        `/CompanyInfo/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getByCurrentUser(
  ): Promise<ApiResponse<CompanyInfoType>> {
    try {
      const response = await apiService.get<CompanyInfoType>(
        `/CompanyInfo/GetByCurrentUser`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async updateStatus(
    request: CompanyInfoUpdateStatusRequestType
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.put<any>(
        `/CompanyInfo/UpdateStatus`,
        request
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
        `/CompanyInfo/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default CompanyInfoServiceGenerated;
