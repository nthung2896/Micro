import { ApiResponse, DropdownOption, PagedList } from "@/types/general";
import {
  PlatformManageListType,
  PlatformManageType,
} from "@/types/platformManage/dto";

import {
  PlatformTransitionRequestType,
  PlatformBulkTransitionRequestType,
  PlatformManageOnlineBookingUpdateType,
  PlatformManageSearchType,
  PlatformManageCreateRequestType,
  PlatformManageOnlineBookingCreateType,
} from "@/types/platformManage/request";
import { apiService } from "../index";
import { CertificateInfo, SignResultItem } from "@/libs/moit-sign/types";
import { SignatureInfoType } from "@/types/signatureInfo/dto";
import { DuyetAuthenticationContractRequestType } from "@/types/authenticationContract/request";

export interface PlatformThongKeDto {
  statuses: { [key: number]: number };
}

export interface ContractThongKeDto {
  statuses: { [key: number]: number };
}

export interface SpecialistStatsDto {
  id: string;
  name: string;
  maCanBo: string;
  nenTangDatHangTrucTuyen: { [key: number]: number };
  nenTangWebTbbh: { [key: number]: number };
  nenTangAppTbbh: { [key: number]: number };
  nenTangWebCcdv: { [key: number]: number };
  nenTangAppCcdv: { [key: number]: number };
  nenTangKinhDoanhTrucTiepNuocNgoai: { [key: number]: number };
  nenTangTrungGianTrongNuoc: { [key: number]: number };
  nenTangTrungGianNuocNgoai: { [key: number]: number };
  chungThucHopDongDienTu: { [key: number]: number };
  rutTienKyQuy: { [key: number]: number };
}

export interface DashboardThongKeHoSoNenTangDto {
  nenTangTrucTuyen: PlatformThongKeDto;
  datHangNuocNgoai: PlatformThongKeDto;
  trungGianTrongNuoc: PlatformThongKeDto;
  trungGianNuocNgoai: PlatformThongKeDto;
  hopDongDienTu: ContractThongKeDto;
  rutTienKyQuy: PlatformThongKeDto;
}

export interface DashboardThongKeChuyenVienDto {
  specialists: SpecialistStatsDto[];
}

export interface ThongKeChuyenVienDetailSearchType {
  specialistId: string;
  groupType: string;
  appManageTypeId?: number;
  status?: number;
  month?: number;
  year?: number;
  createdDateFrom?: string;
  createdDateTo?: string;
  pageIndex: number;
  pageSize: number;
  mauSo?: string;
}

export interface ThongKeChuyenVienDetailDtoType {
  id: string;
  name: string;
  merchantName: string;
  registrationDate?: string;
  updatedDate?: string;
  statusName: string;
}

class PlatformManageService {
  private static _instance: PlatformManageService;
  public static get instance(): PlatformManageService {
    if (!PlatformManageService._instance) {
      PlatformManageService._instance = new PlatformManageService();
    }
    return PlatformManageService._instance;
  }

  public async getData(
    search: PlatformManageSearchType,
  ): Promise<ApiResponse<PagedList<PlatformManageType>>> {
    return apiService.post<PagedList<PlatformManageType>>(
      `/PlatformManage/GetData`,
      search,
    );
  }

  public async getOnlinePlatformData(
    search: PlatformManageSearchType,
  ): Promise<ApiResponse<PagedList<PlatformManageListType>>> {
    return apiService.post<PagedList<PlatformManageListType>>(
      `/PlatformManage/GetOnlinePlatformData`,
      search,
    );
  }

  public async get(id: string): Promise<ApiResponse<PlatformManageType>> {
    return apiService.get<PlatformManageType>(`/PlatformManage/Get/${id}`);
  }

  public async create(
    payload: PlatformManageCreateRequestType,
  ): Promise<ApiResponse<PlatformManageType>> {
    return apiService.post<PlatformManageType>(
      `/PlatformManage/Create`,
      payload,
    );
  }

  public async update(
    payload: PlatformManageCreateRequestType & { id: string },
  ): Promise<ApiResponse<PlatformManageType>> {
    return apiService.put<PlatformManageType>(
      `/PlatformManage/Update`,
      payload,
    );
  }

  public async createOnlineBooking(
    payload: PlatformManageOnlineBookingCreateType,
  ): Promise<ApiResponse<PlatformManageType>> {
    return apiService.post<PlatformManageType>(
      `/PlatformManage/CreateOnlineBooking`,
      payload,
    );
  }

  public async updateOnlineBooking(
    payload: PlatformManageOnlineBookingUpdateType,
  ): Promise<ApiResponse<PlatformManageType>> {
    return apiService.put<PlatformManageType>(
      `/PlatformManage/UpdateOnlineBooking`,
      payload,
    );
  }

  public async transition(
    payload: PlatformTransitionRequestType,
  ): Promise<ApiResponse<any>> {
    return apiService.post<any>(`/PlatformManage/Transition`, payload);
  }

  public async bulkTransition(
    payload: PlatformBulkTransitionRequestType,
  ): Promise<ApiResponse<string[]>> {
    return apiService.post<string[]>(`/PlatformManage/BulkTransition`, payload);
  }

  public async delete(id: string): Promise<ApiResponse> {
    return apiService.delete(`/PlatformManage/Delete/${id}`);
  }

  public async getOnlinePlatformStatusCounts(
    search: PlatformManageSearchType,
  ): Promise<ApiResponse<{ [key: number]: number }>> {
    return apiService.post<{ [key: number]: number }>(
      `/PlatformManage/GetOnlinePlatformStatusCounts`,
      search,
    );
  }

  public async assignProcessing(
    ids: string[],
    specialistId: string,
    specialistName: string,
  ): Promise<ApiResponse<number>> {
    return apiService.post<number>(`/PlatformManage/AssignProcessing`, {
      ids,
      specialistId,
      specialistName,
    });
  }

  public async getSpecialistsByOrganization(
    id: string,
  ): Promise<ApiResponse<DropdownOption[]>> {
    return apiService.get<DropdownOption[]>(
      `/PlatformManage/GetSpecialistsByOrganization/${id}`,
    );
  }

  public async markBigPlatform(payload: {
    id: string;
    isBig: boolean;
    note?: string;
  }): Promise<ApiResponse<boolean>> {
    return apiService.post<boolean>(`/PlatformManage/MarkBigPlatform`, payload);
  }

  public async getHistory(id: string): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>(`/PlatformManage/History/${id}`);
  }

  public async devUpdateStatus(payload: {
    id: string;
    targetStatus: number;
    note?: string;
  }): Promise<ApiResponse<any>> {
    return apiService.post<any>(`/PlatformManage/DevUpdateStatus`, payload);
  }

  public async devBulkUpdateStatus(payload: {
    ids: string[];
    targetStatus: number;
    note?: string;
  }): Promise<ApiResponse<any>> {
    return apiService.post<any>(`/PlatformManage/DevBulkUpdateStatus`, payload);
  }

  public async getPlatformData(
    search: PlatformManageSearchType,
  ): Promise<ApiResponse<PagedList<PlatformManageType>>> {
    return apiService.post<PagedList<PlatformManageType>>(
      `/PlatformManage/GetPlatformData`,
      search,
    );
  }

  public async getPlatformStatusCounts(
    search: PlatformManageSearchType,
  ): Promise<ApiResponse<{ [key: number]: number }>> {
    return apiService.post<{ [key: number]: number }>(
      `/PlatformManage/GetPlatformStatusCounts`,
      search,
    );
  }

  public async platformTransition(
    payload: PlatformTransitionRequestType,
  ): Promise<ApiResponse<any>> {
    return apiService.post<any>(`/PlatformManage/PlatformTransition`, payload);
  }

  public async platformBulkTransition(
    payload: PlatformBulkTransitionRequestType,
  ): Promise<ApiResponse<string[]>> {
    return apiService.post<string[]>(
      `/PlatformManage/PlatformBulkTransition`,
      payload,
    );
  }

  public async platformAssignProcessing(
    ids: string[],
    specialistId: string,
    specialistName: string,
  ): Promise<ApiResponse<number>> {
    return apiService.post<number>(`/PlatformManage/PlatformAssignProcessing`, {
      ids,
      specialistId,
      specialistName,
    });
  }

  public async platformDelete(id: string): Promise<ApiResponse> {
    return apiService.delete(`/PlatformManage/PlatformDelete/${id}`);
  }

  public async platformDevBulkUpdateStatus(payload: {
    ids: string[];
    targetStatus: number;
    note?: string;
  }): Promise<ApiResponse<any>> {
    return apiService.post<any>(
      `/PlatformManage/PlatformDevBulkUpdateStatus`,
      payload,
    );
  }

  public async getDashboardThongKeHoSoNenTang(
    search: PlatformManageSearchType,
  ): Promise<ApiResponse<DashboardThongKeHoSoNenTangDto>> {
    return apiService.post<DashboardThongKeHoSoNenTangDto>(
      `/PlatformManage/GetDashboardThongKeHoSoNenTang`,
      search,
    );
  }

  public async getDashboardThongKeChuyenVien(
    search: PlatformManageSearchType,
  ): Promise<ApiResponse<DashboardThongKeChuyenVienDto>> {
    return apiService.post<DashboardThongKeChuyenVienDto>(
      `/PlatformManage/GetDashboardThongKeChuyenVien`,
      search,
    );
  }

  public async exportDashboardThongKeHoSoNenTang(
    search: PlatformManageSearchType,
  ): Promise<ApiResponse<string>> {
    return apiService.post<string>(
      `/PlatformManage/ExportDashboardThongKeHoSoNenTang`,
      search,
    );
  }

  public async getDashboardThongKeChuyenVienDetail(
    search: ThongKeChuyenVienDetailSearchType,
  ): Promise<ApiResponse<PagedList<ThongKeChuyenVienDetailDtoType>>> {
    return apiService.post<PagedList<ThongKeChuyenVienDetailDtoType>>(
      `/PlatformManage/GetDashboardThongKeChuyenVienDetail`,
      search,
    );
  }

  public async sign(payload: {
    signResultItems: SignResultItem[];
    certificateInfo: CertificateInfo;
  }): Promise<ApiResponse> {
    try {
      const response = await apiService.post(`/PlatformManage/Sign`, payload);
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getSignature(
    id: string,
  ): Promise<ApiResponse<SignatureInfoType[]>> {
    try {
      const response = await apiService.get<SignatureInfoType[]>(
        `/PlatformManage/GetSignature/${id}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async decodeRawData(rawData: string): Promise<ApiResponse<string>> {
    try {
      const response = await apiService.get<string>(
        `/PlatformManage/DecodeRawData?data=${encodeURIComponent(rawData)}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getListRawData(
    payload: DuyetAuthenticationContractRequestType,
  ): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiService.post<any[]>(
        `/PlatformManage/GetListRawData`,
        payload,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async exportOnlinePlatformData(
    search: PlatformManageSearchType,
    selectedFields: string[]
  ): Promise<ApiResponse<string>> {
    return apiService.post<string>(`/PlatformManage/ExportOnlinePlatformData`, {
      search,
      selectedFields,
    });
  }
}

const platformManageService = PlatformManageService.instance;
export default platformManageService;
