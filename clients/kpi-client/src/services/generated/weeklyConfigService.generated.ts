import {
  WeeklyConfigType,
} from "@/types/weeklyConfig/dto";
import {
  WeeklyConfigRequestType,
  WeeklyConfigSearchType,
} from "@/types/weeklyConfig/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class WeeklyConfigServiceGenerated {
  public async create(
    model: WeeklyConfigRequestType
  ): Promise<ApiResponse<WeeklyConfigType>> {
    try {
      const response = await apiService.post<WeeklyConfigType>(
        `/WeeklyConfig/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: WeeklyConfigRequestType
  ): Promise<ApiResponse<WeeklyConfigType>> {
    try {
      const response = await apiService.put<WeeklyConfigType>(
        `/WeeklyConfig/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<WeeklyConfigType>> {
    try {
      const response = await apiService.get<WeeklyConfigType>(
        `/WeeklyConfig/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: WeeklyConfigSearchType
  ): Promise<ApiResponse<PagedList<WeeklyConfigType>>> {
    try {
      const response = await apiService.post<PagedList<WeeklyConfigType>>(
        `/WeeklyConfig/GetData`,
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
        `/WeeklyConfig/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default WeeklyConfigServiceGenerated;
