import {
  RoleOperationType,
  RoleOperationViewModelType,
} from "@/types/roleOperation/dto";
import {
  RoleOperationRequestType,
  RoleOperationSearchType,
} from "@/types/roleOperation/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class RoleOperationServiceGenerated {
  public async create(
    model: RoleOperationRequestType
  ): Promise<ApiResponse<RoleOperationType[]>> {
    try {
      const response = await apiService.post<RoleOperationType[]>(
        `/RoleOperation/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: RoleOperationRequestType
  ): Promise<ApiResponse<RoleOperationType>> {
    try {
      const response = await apiService.post<RoleOperationType>(
        `/RoleOperation/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<RoleOperationType>> {
    try {
      const response = await apiService.get<RoleOperationType>(
        `/RoleOperation/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: RoleOperationSearchType
  ): Promise<ApiResponse<PagedList<RoleOperationType>>> {
    try {
      const response = await apiService.post<PagedList<RoleOperationType>>(
        `/RoleOperation/GetData`,
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
        `/RoleOperation/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getOperationByRoleId(
    id?: string
  ): Promise<ApiResponse<RoleOperationViewModelType[]>> {
    try {
      const response = await apiService.get<RoleOperationViewModelType[]>(
        `/RoleOperation/GetOperationByRoleId/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default RoleOperationServiceGenerated;
