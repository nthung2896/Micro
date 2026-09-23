import {
  TinhType,
} from "@/types/tinh/dto";
import {
  TinhRequestType,
  TinhSearchType,
} from "@/types/tinh/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class TinhServiceGenerated {
  public async create(
    model: TinhRequestType
  ): Promise<ApiResponse<TinhType>> {
    try {
      const response = await apiService.post<TinhType>(
        `/Tinh/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: TinhRequestType
  ): Promise<ApiResponse<TinhType>> {
    try {
      const response = await apiService.put<TinhType>(
        `/Tinh/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<TinhType>> {
    try {
      const response = await apiService.get<TinhType>(
        `/Tinh/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: TinhSearchType
  ): Promise<ApiResponse<PagedList<TinhType>>> {
    try {
      const response = await apiService.post<PagedList<TinhType>>(
        `/Tinh/GetData`,
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
        `/Tinh/Delete/${id}`
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
        `/Tinh/GetDropdowns?types=${types}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async exportExcel(
    search: TinhSearchType
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/Tinh/ExportExcel`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async exportTemplateImport(
  ): Promise<ApiResponse<string>> {
    try {
      const response = await apiService.get<string>(
        `/Tinh/ExportTemplateImport`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async import(
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.get(
        `/Tinh/Import`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async importExcel(
    data: DataImport
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/Tinh/ImportExcel`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async saveImport(
    data: TinhRequestType[]
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/Tinh/SaveImport`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default TinhServiceGenerated;
