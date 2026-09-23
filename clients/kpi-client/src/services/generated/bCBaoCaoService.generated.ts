import { BCBaoCaoType } from "@/types/bCBaoCao/dto";
import {
  BCBaoCaoRequestType,
  BCBaoCaoSearchType,
} from "@/types/bCBaoCao/request";
import {
  ApiResponse,
  PagedList,
  DropdownOption,
  DropdownOptionTree,
  Dictionary,
  DataImport,
} from "@/types/general";
import { apiService } from "../index";
import { BCFormTemplateType } from "@/types/bcFormTemplate/dto";

class BCBaoCaoServiceGenerated {
  public async create(
    model: BCBaoCaoRequestType,
  ): Promise<ApiResponse<BCBaoCaoType>> {
    try {
      const response = await apiService.post<BCBaoCaoType>(
        `/BCBaoCao/Create`,
        model,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: BCBaoCaoRequestType,
  ): Promise<ApiResponse<BCBaoCaoType>> {
    try {
      const response = await apiService.put<BCBaoCaoType>(
        `/BCBaoCao/Update`,
        model,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(id: string): Promise<ApiResponse<BCBaoCaoType>> {
    try {
      const response = await apiService.get<BCBaoCaoType>(
        `/BCBaoCao/Get/${id}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: BCBaoCaoSearchType,
  ): Promise<ApiResponse<PagedList<BCBaoCaoType>>> {
    try {
      const response = await apiService.post<PagedList<BCBaoCaoType>>(
        `/BCBaoCao/GetData`,
        search,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async delete(id: string): Promise<ApiResponse> {
    try {
      const response = await apiService.delete(`/BCBaoCao/Delete/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdowns(
    types?: string[],
  ): Promise<ApiResponse<Dictionary<DropdownOption[]>>> {
    try {
      const response = await apiService.get<Dictionary<DropdownOption[]>>(
        `/BCBaoCao/GetDropdowns?types=${types}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default BCBaoCaoServiceGenerated;
