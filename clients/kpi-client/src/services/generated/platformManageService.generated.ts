import {
  PlatformManageListType,
  PlatformManageType,
} from "@/types/platformManage/dto";
import {
  PlatformManageCreateRequestType,
  PlatformManageOnlineBookingCreateRequestType,
  PlatformManageOnlineBookingUpdateRequestType,
  PlatformManageSearchType,
  PlatformManageUpdateRequestType,
  PlatformTransitionRequestType,
} from "@/types/platformManage/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport } from "@/types/general";
import { apiService } from "../index";

class PlatformManageServiceGenerated {
  public async getData(
    search: PlatformManageSearchType
  ): Promise<ApiResponse<PagedList<PlatformManageType>>> {
    try {
      const response = await apiService.post<PagedList<PlatformManageType>>(
        `/PlatformManage/GetData`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<PlatformManageType>> {
    try {
      const response = await apiService.get<PlatformManageType>(
        `/PlatformManage/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async create(
    request: PlatformManageCreateRequestType
  ): Promise<ApiResponse<PlatformManageType>> {
    try {
      const response = await apiService.post<PlatformManageType>(
        `/PlatformManage/Create`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    request: PlatformManageUpdateRequestType
  ): Promise<ApiResponse<PlatformManageType>> {
    try {
      const response = await apiService.put<PlatformManageType>(
        `/PlatformManage/Update`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async transition(
    request: PlatformTransitionRequestType
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.post<any>(
        `/PlatformManage/Transition`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getOnlinePlatformData(
    search: PlatformManageSearchType
  ): Promise<ApiResponse<PagedList<PlatformManageListType>>> {
    try {
      const response = await apiService.post<PagedList<PlatformManageListType>>(
        `/PlatformManage/GetOnlinePlatformData`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async createOnlineBooking(
    request: PlatformManageOnlineBookingCreateRequestType
  ): Promise<ApiResponse<PlatformManageType>> {
    try {
      const response = await apiService.post<PlatformManageType>(
        `/PlatformManage/CreateOnlineBooking`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async updateOnlineBooking(
    request: PlatformManageOnlineBookingUpdateRequestType
  ): Promise<ApiResponse<PlatformManageType>> {
    try {
      const response = await apiService.put<PlatformManageType>(
        `/PlatformManage/UpdateOnlineBooking`,
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
        `/PlatformManage/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default PlatformManageServiceGenerated;
