import {
  ModuleGroupType,
  ModuleType,
} from "@/types/module/dto";
import {
  ModuleRequestType,
  ModuleSearchType,
} from "@/types/module/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class ModuleServiceGenerated {
  public async create(
    model: ModuleRequestType
  ): Promise<ApiResponse<ModuleType>> {
    try {
      const response = await apiService.post<ModuleType>(
        `/Module/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: ModuleRequestType
  ): Promise<ApiResponse<ModuleType>> {
    try {
      const response = await apiService.put<ModuleType>(
        `/Module/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<ModuleType>> {
    try {
      const response = await apiService.get<ModuleType>(
        `/Module/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: ModuleSearchType
  ): Promise<ApiResponse<PagedList<ModuleType>>> {
    try {
      const response = await apiService.post<PagedList<ModuleType>>(
        `/Module/GetData`,
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
        `/Module/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropModule(
    selected?: string
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.post<DropdownOption[]>(
        `/Module/GetDropModule?selected=${selected}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getModuleGroupData(
    roleId: string
  ): Promise<ApiResponse<ModuleGroupType[]>> {
    try {
      const response = await apiService.get<ModuleGroupType[]>(
        `/Module/GetModuleGroupData?roleId=${roleId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default ModuleServiceGenerated;
