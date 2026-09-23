import {
  HuyenType,
} from "@/types/huyen/dto";
import {
  HuyenRequestType,
  HuyenSearchType,
} from "@/types/huyen/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class HuyenServiceGenerated {
  public async create(
    model: HuyenRequestType
  ): Promise<ApiResponse<HuyenType>> {
    try {
      const response = await apiService.post<HuyenType>(
        `/Huyen/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: HuyenRequestType
  ): Promise<ApiResponse<HuyenType>> {
    try {
      const response = await apiService.put<HuyenType>(
        `/Huyen/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<HuyenType>> {
    try {
      const response = await apiService.get<HuyenType>(
        `/Huyen/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: HuyenSearchType
  ): Promise<ApiResponse<PagedList<HuyenType>>> {
    try {
      const response = await apiService.post<PagedList<HuyenType>>(
        `/Huyen/GetData`,
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
        `/Huyen/Delete/${id}`
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
        `/Huyen/GetDropdowns?types=${types}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async exportExcel(
    search: HuyenSearchType
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/Huyen/ExportExcel`,
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
        `/Huyen/ExportTemplateImport`
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
        `/Huyen/Import`
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
        `/Huyen/ImportExcel`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async saveImport(
    data: HuyenRequestType[]
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/Huyen/SaveImport`,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default HuyenServiceGenerated;
