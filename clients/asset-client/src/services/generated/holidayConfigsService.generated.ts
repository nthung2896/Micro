import {
  HolidayConfigsType,
} from "@/types/holidayConfigs/dto";
import {
  HolidayConfigsRequestType,
  HolidayConfigsSearchType,
} from "@/types/holidayConfigs/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class HolidayConfigsServiceGenerated {
  public async create(
    model: HolidayConfigsRequestType
  ): Promise<ApiResponse<HolidayConfigsType>> {
    try {
      const response = await apiService.post<HolidayConfigsType>(
        `/HolidayConfigs/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: HolidayConfigsRequestType
  ): Promise<ApiResponse<HolidayConfigsType>> {
    try {
      const response = await apiService.put<HolidayConfigsType>(
        `/HolidayConfigs/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<HolidayConfigsType>> {
    try {
      const response = await apiService.get<HolidayConfigsType>(
        `/HolidayConfigs/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: HolidayConfigsSearchType
  ): Promise<ApiResponse<PagedList<HolidayConfigsType>>> {
    try {
      const response = await apiService.post<PagedList<HolidayConfigsType>>(
        `/HolidayConfigs/GetData`,
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
        `/HolidayConfigs/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getCalculateDeadline(
    startDate: Date,
    durationTime: number
  ): Promise<ApiResponse<Date>> {
    try {
      const response = await apiService.post<Date>(
        `/HolidayConfigs/CalculateDeadline?startDate=${startDate}&durationTime=${durationTime}`,
        null
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
        `/HolidayConfigs/GetDropdowns?types=${types}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default HolidayConfigsServiceGenerated;
