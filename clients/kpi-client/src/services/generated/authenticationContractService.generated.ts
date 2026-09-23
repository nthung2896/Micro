import {
  AuthenticationContractType,
  CreateDataType,
} from "@/types/authenticationContract/dto";
import {
  AuthenticationContractRequestType,
  AuthenticationContractSearchType,
  AuthenticationContractUpdateRequestType,
} from "@/types/authenticationContract/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class AuthenticationContractServiceGenerated {
  public async createAuthenticationConstract(
    request: AuthenticationContractRequestType,
    username: string,
    syncDvc?: boolean
  ): Promise<ApiResponse<AuthenticationContractType>> {
    try {
      const query = syncDvc ? "?syncDvc=true" : "";
      const response = await apiService.post<AuthenticationContractType>(
        `/AuthenticationContract/${username}${query}`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async updateAuthenticationConstract(
    request: AuthenticationContractRequestType,
    id: string
  ): Promise<ApiResponse<AuthenticationContractType>> {
    try {
      const response = await apiService.put<AuthenticationContractType>(
        `/AuthenticationContract/${id}`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getCreateContractData(
    username: string
  ): Promise<ApiResponse<CreateDataType>> {
    try {
      const response = await apiService.get<CreateDataType>(
        `/AuthenticationContract/${username}/create-data`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async updateStatus(
    request: AuthenticationContractUpdateRequestType,
    id: string,
    actionStatus: number
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.put(
        `/AuthenticationContract/UpdateStatus?id=${id}&actionStatus=${actionStatus}`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: AuthenticationContractSearchType
  ): Promise<ApiResponse<PagedList<AuthenticationContractType>>> {
    try {
      const response = await apiService.post<PagedList<AuthenticationContractType>>(
        `/AuthenticationContract/GetData`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<AuthenticationContractType>> {
    try {
      const response = await apiService.get<AuthenticationContractType>(
        `/AuthenticationContract/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdowns(
    types?: string[]
  ): Promise<ApiResponse<Dictionary<DropdownOption[]>>> {
    try {
      const response = await apiService.get<Dictionary<DropdownOption[]>>(
        `/AuthenticationContract/GetDropdowns?types=${types}`
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
        `/AuthenticationContract/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async asignTaskForChuyenVien(
    id: string,
    chuyenVienId: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.put(
        `/AuthenticationContract/${id}/asign-task/${chuyenVienId}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getStatusCounts(
    search: AuthenticationContractSearchType
  ): Promise<ApiResponse<Dictionary<number>>> {
    try {
      const response = await apiService.post<Dictionary<number>>(
        `/AuthenticationContract/GetStatusCounts`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async exportExcel(request: {
    search?: AuthenticationContractSearchType;
    selectedFields?: string[];
  }): Promise<ApiResponse<string>> {
    try {
      const response = await apiService.post<string>(
        `/AuthenticationContract/ExportExcel`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default AuthenticationContractServiceGenerated;
