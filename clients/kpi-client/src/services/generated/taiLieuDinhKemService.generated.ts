import {
  DanhSachTaiLieuType,
  FileInfoResponseType,
  TaiLieuDinhKemType,
} from "@/types/taiLieuDinhKem/dto";
import {
  UploadAndSaveFileRequestType,
  UploadFileRequestType,
} from "@/types/taiLieuDinhKem/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class TaiLieuDinhKemServiceGenerated {
  public async uploadDocument(
    form: FormData
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response = await apiService.post<TaiLieuDinhKemType[]>(
        `/TaiLieuDinhKem/uploadDocument`,
        form
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async uploadAndSaveDb(
    form: FormData
  ): Promise<ApiResponse<TaiLieuDinhKemType>> {
    try {
      const response = await apiService.post<TaiLieuDinhKemType>(
        `/TaiLieuDinhKem/uploadAndSaveDb`,
        form
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getFileInfo(
    id: string
  ): Promise<ApiResponse<FileInfoResponseType>> {
    try {
      const response = await apiService.get<FileInfoResponseType>(
        `/TaiLieuDinhKem/GetFileInfo/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getPathFileById(
    id: string
  ): Promise<ApiResponse<string>> {
    try {
      const response = await apiService.get<string>(
        `/TaiLieuDinhKem/GetPathFileById/{itemId}?id=${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getById(
    id: string
  ): Promise<ApiResponse<TaiLieuDinhKemType>> {
    try {
      const response = await apiService.get<TaiLieuDinhKemType>(
        `/TaiLieuDinhKem/GetById/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDanhSachRutGon(
    keyword?: string,
    loaiTaiLieu?: string
  ): Promise<ApiResponse<DanhSachTaiLieuType[]>> {
    try {
      const response = await apiService.get<DanhSachTaiLieuType[]>(
        `/TaiLieuDinhKem/GetDanhSachTaiLieu?keyword=${keyword}&loaiTaiLieu=${loaiTaiLieu}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default TaiLieuDinhKemServiceGenerated;
