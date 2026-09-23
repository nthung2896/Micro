import {
  RoleType,
} from "@/types/role/dto";
import {
  RoleOperationMultiRequestType,
  RoleRequestType,
  RoleSearchType,
} from "@/types/role/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class RoleServiceGenerated {
  public async create(
    model: RoleRequestType
  ): Promise<ApiResponse<RoleType>> {
    try {
      const response = await apiService.post<RoleType>(
        `/Role/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: RoleRequestType
  ): Promise<ApiResponse<RoleType>> {
    try {
      const response = await apiService.put<RoleType>(
        `/Role/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async switchActiveRole(
    id: string
  ): Promise<ApiResponse<RoleType>> {
    try {
      const response = await apiService.put<RoleType>(
        `/Role/SwitchActiveRole/${id}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<RoleType>> {
    try {
      const response = await apiService.get<RoleType>(
        `/Role/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: RoleSearchType
  ): Promise<ApiResponse<PagedList<RoleType>>> {
    try {
      const response = await apiService.post<PagedList<RoleType>>(
        `/Role/GetData`,
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
        `/Role/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getRole(
    id: string
  ): Promise<ApiResponse<RoleType[]>> {
    try {
      const response = await apiService.post<RoleType[]>(
        `/Role/GetRole/${id}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async saveConfigureOperation(
    model: RoleOperationMultiRequestType
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/Role/SaveConfigureOperation?model=${model}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropVaiTro(
    selected?: string
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.post<DropdownOption[]>(
        `/Role/GetDropVaiTro?selected=${selected}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropDownVaiTroIds(
    selected?: string
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.post<DropdownOption[]>(
        `/Role/GetDropDownVaiTroIds?selected=${selected}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdownId(
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/Role/GetDropdownId`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default RoleServiceGenerated;
