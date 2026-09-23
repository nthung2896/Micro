import {
  AppUserType,
} from "@/types/appUser/dto";
import {
  AspNetUsersType,
} from "@/types/aspNetUsers/dto";
import {
  AspNetUsersRequestType,
  AspNetUsersSearchType,
} from "@/types/aspNetUsers/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class AspNetUsersServiceGenerated {
  public async create(
    model: AspNetUsersRequestType
  ): Promise<ApiResponse<AspNetUsersType>> {
    try {
      const response = await apiService.post<AspNetUsersType>(
        `/AspNetUsers/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: AspNetUsersRequestType
  ): Promise<ApiResponse<AspNetUsersType>> {
    try {
      const response = await apiService.put<AspNetUsersType>(
        `/AspNetUsers/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<AspNetUsersType>> {
    try {
      const response = await apiService.get<AspNetUsersType>(
        `/AspNetUsers/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: AspNetUsersSearchType
  ): Promise<ApiResponse<PagedList<AppUserType>>> {
    try {
      const response = await apiService.post<PagedList<AppUserType>>(
        `/AspNetUsers/GetData`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getListUserByRole(
    search: AspNetUsersSearchType
  ): Promise<ApiResponse<PagedList<AppUserType>>> {
    try {
      const response = await apiService.post<PagedList<AppUserType>>(
        `/AspNetUsers/GetListUserByRole`,
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
        `/AspNetUsers/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async lockUser(
    id: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.delete(
        `/AspNetUsers/Lock/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async exportExcel(
    search: AspNetUsersSearchType
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/AspNetUsers/export`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdown(
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/AspNetUsers/GetDropDown`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getUserByRole(
    search: AspNetUsersSearchType
  ): Promise<ApiResponse<PagedList<AppUserType>>> {
    try {
      const response = await apiService.post<PagedList<AppUserType>>(
        `/AspNetUsers/GetUserByRole`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getCanBoByDonVi(
    donViId: string
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/AspNetUsers/GetCanBoByDonVi?donViId=${donViId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default AspNetUsersServiceGenerated;
