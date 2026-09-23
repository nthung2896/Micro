import AuthenticationContractServiceGenerated from "../generated/authenticationContractService.generated";
import { apiService } from "..";
import { ApiResponse, DropdownOption } from "@/types/general";
import { AuthenticationContractUpdateRequestType, DuyetAuthenticationContractRequestType } from "@/types/authenticationContract/request";
import { SignatureInfoType } from "@/types/signatureInfo/dto";
import { CertificateInfo } from "@/libs/moit-sign";
import { SignResultItem } from "@/libs/moit-sign/types";

export type AuthenticationContractDropdowns = {
  donViCungCapHosting: DropdownOption[];
  authContractCategoryCode: DropdownOption[];
  ngonNgu: DropdownOption[];
  oscode: DropdownOption[];
};

class AuthenticationContractService extends AuthenticationContractServiceGenerated {
  private static _instance: AuthenticationContractService;
  public static get instance(): AuthenticationContractService {
    if (!AuthenticationContractService._instance) {
      AuthenticationContractService._instance = new AuthenticationContractService();
    }
    return AuthenticationContractService._instance;
  }
  public async updateStatus(
    request: AuthenticationContractUpdateRequestType,
    id: string,
    actionStatus: number,

  ): Promise<ApiResponse> {
    try {
      const response = await apiService.put(
        `/AuthenticationContract/${id}/status/${actionStatus}`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async takeTask(id: string): Promise<ApiResponse> {
    try {
      const response = await apiService.put(
        `/AuthenticationContract/${id}/take-task`,
        {}
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getSignature(id: string): Promise<ApiResponse<SignatureInfoType[]>> {
    try {
      const response = await apiService.get<SignatureInfoType[]>(
        `/AuthenticationContract/GetSignature/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async decodeRawData(rawData: string): Promise<ApiResponse<string>> {
    try {
      const response = await apiService.get<string>(
        `/AuthenticationContract/DecodeRawData?data=${encodeURIComponent(rawData)}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getListRawData(payload: DuyetAuthenticationContractRequestType): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiService.post<any[]>(
        `/AuthenticationContract/GetListRawData`,
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
        `/AuthenticationContract/Sign`,
        payload
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async asignTasksMultiple(payload: {
    ids: string[];
    chuyenVienId: string;
  }): Promise<ApiResponse> {
    try {
      const response = await apiService.put(
        `/AuthenticationContract/asign-tasks-multiple`,
        payload
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async takeTasksMultiple(payload: {
    ids: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await apiService.put(
        `/AuthenticationContract/take-tasks-multiple`,
        payload
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async dvcSync(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.post<any>(
        `/AuthenticationContract/DvcSync/${id}`,
        {}
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async dvcSyncBulk(ids: string[]): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.post<any>(
        `/AuthenticationContract/DvcSyncBulk`,
        ids
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}
const authenticationContractService = AuthenticationContractService.instance;
export default authenticationContractService;
