import {
  DanhMucType,
  DM_NhomDanhMucType,
} from "@/types/dM_NhomDanhMuc/dto";
import {
  DM_NhomDanhMucRequestType,
  DM_NhomDanhMucSearchType,
} from "@/types/dM_NhomDanhMuc/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class DM_NhomDanhMucServiceGenerated {
  public async create(
    model: DM_NhomDanhMucRequestType
  ): Promise<ApiResponse<DM_NhomDanhMucType>> {
    try {
      const response = await apiService.post<DM_NhomDanhMucType>(
        `/DM_NhomDanhMuc/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: DM_NhomDanhMucRequestType
  ): Promise<ApiResponse<DM_NhomDanhMucType>> {
    try {
      const response = await apiService.put<DM_NhomDanhMucType>(
        `/DM_NhomDanhMuc/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<DM_NhomDanhMucType>> {
    try {
      const response = await apiService.get<DM_NhomDanhMucType>(
        `/DM_NhomDanhMuc/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: DM_NhomDanhMucSearchType
  ): Promise<ApiResponse<PagedList<DM_NhomDanhMucType>>> {
    try {
      const response = await apiService.post<PagedList<DM_NhomDanhMucType>>(
        `/DM_NhomDanhMuc/GetData`,
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
        `/DM_NhomDanhMuc/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDanhSachDanhMuc(
  ): Promise<ApiResponse<DanhMucType[]>> {
    try {
      const response = await apiService.get<DanhMucType[]>(
        `/DM_NhomDanhMuc/GetDanhSachDanhMuc`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async exportExcel(
    search: DM_NhomDanhMucSearchType
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/DM_NhomDanhMuc/Export`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default DM_NhomDanhMucServiceGenerated;
