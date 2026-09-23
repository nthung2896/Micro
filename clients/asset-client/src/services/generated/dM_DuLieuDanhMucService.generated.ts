import {
  ChucVuThuTuType,
  DM_DuLieuDanhMucType,
} from "@/types/dM_DuLieuDanhMuc/dto";
import {
  DM_DuLieuDanhMucRequestType,
  DM_DuLieuDanhMucSearchType,
} from "@/types/dM_DuLieuDanhMuc/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class DM_DuLieuDanhMucServiceGenerated {
  public async create(
    model: DM_DuLieuDanhMucRequestType
  ): Promise<ApiResponse<DM_DuLieuDanhMucType>> {
    try {
      const response = await apiService.post<DM_DuLieuDanhMucType>(
        `/DM_DuLieuDanhMuc/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: DM_DuLieuDanhMucRequestType
  ): Promise<ApiResponse<DM_DuLieuDanhMucType>> {
    try {
      const response = await apiService.put<DM_DuLieuDanhMucType>(
        `/DM_DuLieuDanhMuc/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<DM_DuLieuDanhMucType>> {
    try {
      const response = await apiService.get<DM_DuLieuDanhMucType>(
        `/DM_DuLieuDanhMuc/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: DM_DuLieuDanhMucSearchType
  ): Promise<ApiResponse<PagedList<DM_DuLieuDanhMucType>>> {
    try {
      const response = await apiService.post<PagedList<DM_DuLieuDanhMucType>>(
        `/DM_DuLieuDanhMuc/GetData`,
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
        `/DM_DuLieuDanhMuc/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async exportExcel(
    search: DM_DuLieuDanhMucSearchType
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/DM_DuLieuDanhMuc/Export`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdown(
    groupCode: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.get(
        `/DM_DuLieuDanhMuc/GetDropdown/${groupCode}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdownCode(
    groupCode: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.get(
        `/DM_DuLieuDanhMuc/GetDropdownCode/${groupCode}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getListDataByGroupCode(
    groupCode: string
  ): Promise<ApiResponse<DM_DuLieuDanhMucType[]>> {
    try {
      const response = await apiService.get<DM_DuLieuDanhMucType[]>(
        `/DM_DuLieuDanhMuc/GetListDataByGroupCode/${groupCode}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getAllByGroupCode(
    groupCode: string
  ): Promise<ApiResponse<DM_DuLieuDanhMucType[]>> {
    try {
      const response = await apiService.get<DM_DuLieuDanhMucType[]>(
        `/DM_DuLieuDanhMuc/GetAllByGroupCode/${groupCode}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getChucVuThuTu(
  ): Promise<ApiResponse<ChucVuThuTuType[]>> {
    try {
      const response = await apiService.get<ChucVuThuTuType[]>(
        `/DM_DuLieuDanhMuc/GetChucVuThuTu`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default DM_DuLieuDanhMucServiceGenerated;
