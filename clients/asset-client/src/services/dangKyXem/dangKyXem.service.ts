import {
  DangKyXemType,
} from "@/types/dang-ky-xem/dto";
import {
  DangKyXemRequestType,
  DangKyXemSearchType,
} from "@/types/dang-ky-xem/request";
import { ApiResponse, PagedList } from "@/types/general";
import { apiService } from "../index";
import { SignatureInfoType } from "@/types/signatureInfo/dto";
import { CertificateInfo } from "@/libs/moit-sign";
import { SignResultItem } from "@/libs/moit-sign/types";

class DangKyXemService {
  private static _instance: DangKyXemService;

  public static get instance(): DangKyXemService {
    if (!DangKyXemService._instance) {
      DangKyXemService._instance = new DangKyXemService();
    }
    return DangKyXemService._instance;
  }

  public async create(
    model: DangKyXemRequestType
  ): Promise<ApiResponse<DangKyXemType>> {
    try {
      const response = await apiService.post<DangKyXemType>(
        `/DangKyXem/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: DangKyXemRequestType
  ): Promise<ApiResponse<DangKyXemType>> {
    try {
      const response = await apiService.put<DangKyXemType>(
        `/DangKyXem/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<DangKyXemType>> {
    try {
      const response = await apiService.get<DangKyXemType>(
        `/DangKyXem/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: DangKyXemSearchType
  ): Promise<ApiResponse<PagedList<DangKyXemType>>> {
    try {
      const response = await apiService.post<PagedList<DangKyXemType>>(
        `/DangKyXem/GetData`,
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
        `/DangKyXem/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async approve(
    id: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/DangKyXem/Approve/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async reject(
    model: DangKyXemRequestType
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/DangKyXem/Reject`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdowns(): Promise<ApiResponse> {
    try {
      const response = await apiService.get(
        `/DangKyXem/GetDropdowns`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getAllowedPlatforms(searchData: any): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/DangKyXem/GetAllowedPlatforms`,
        searchData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getSignature(id: string): Promise<ApiResponse<SignatureInfoType[]>> {
    try {
      const response = await apiService.get<SignatureInfoType[]>(
        `/DangKyXem/GetSignature/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getListRawData(payload: {
    listIdHoSo: string[];
    lyDo?: string;
    trangThaiDuyet: number;
  }): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiService.post<any[]>(
        `/DangKyXem/GetListRawData`,
        payload
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async sign(payload: {
    signResultItems: SignResultItem[];
    certificateInfo: CertificateInfo;
  }): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/DangKyXem/Sign`,
        payload
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const dangKyXemService = DangKyXemService.instance;
export default dangKyXemService;
