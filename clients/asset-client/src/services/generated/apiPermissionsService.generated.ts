import {
  ApiPermissionGroupDataType,
  ApiPermissionsType,
} from "@/types/apiPermissions/dto";
import {
  ApiPermissionsSaveVMType,
} from "@/types/apiPermissions/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class ApiPermissionsServiceGenerated {
  public async save(
    model: ApiPermissionsSaveVMType
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/ApiPermissions/Save`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<ApiPermissionsType>> {
    try {
      const response = await apiService.get<ApiPermissionsType>(
        `/ApiPermissions/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getByRoleId(
    roleId: string
  ): Promise<ApiResponse<ApiPermissionGroupDataType[]>> {
    try {
      const response = await apiService.get<ApiPermissionGroupDataType[]>(
        `/ApiPermissions/GetByRoleId/${roleId}`
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
        `/ApiPermissions/Delete/${id}`
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
        `/ApiPermissions/GetDropdowns?types=${types}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default ApiPermissionsServiceGenerated;
