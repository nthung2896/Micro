
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";
import { BCFormTemplateType } from "@/types/bcFormTemplate/dto";
import { BCFormTemplateRequest, BCFormTemplateSearchType } from "@/types/bcFormTemplate/request";

class BCFormTemplateServiceGenerated {
  public async get(
    id: string
  ): Promise<ApiResponse<BCFormTemplateType>> {
    try {
      const response = await apiService.get<BCFormTemplateType>(
        `/BCFormTemplate/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async create(
    request: BCFormTemplateRequest
  ): Promise<ApiResponse<BCFormTemplateType>> {
    try {
      const response = await apiService.post<BCFormTemplateType>(
        `/BCFormTemplate/Create`,
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
        `/BCFormTemplate/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: BCFormTemplateRequest
  ): Promise<ApiResponse<BCFormTemplateType>> {
    try {
      const response = await apiService.put<BCFormTemplateType>(
        `/BCFormTemplate/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
public async getData(
    search: BCFormTemplateSearchType
  ): Promise<ApiResponse<PagedList<BCFormTemplateType>>> {
    try {
      const response = await apiService.post<PagedList<BCFormTemplateType>>(
        `/BCFormTemplate/GetData`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default BCFormTemplateServiceGenerated;
