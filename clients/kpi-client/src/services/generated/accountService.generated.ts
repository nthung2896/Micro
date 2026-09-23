import {
  AppUserType,
  LoginResponseType,
} from "@/types/appUser/dto";
import {
  ChangePasswordViewModelType,
  LoginViewModelType,
  ProfileUserEditRequestType,
  RegisterRequestType,
} from "@/types/appUser/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class AccountServiceGenerated {
  public async register(
    model: RegisterRequestType
  ): Promise<ApiResponse<LoginResponseType>> {
    try {
      const response = await apiService.post<LoginResponseType>(
        `/Account/Register`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async login(
    model: LoginViewModelType
  ): Promise<ApiResponse<LoginResponseType>> {
    try {
      const response = await apiService.post<LoginResponseType>(
        `/Account/Login`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async logout(
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.post(
        `/Account/Logout`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getInfo(
  ): Promise<ApiResponse<AppUserType>> {
    try {
      const response = await apiService.get<AppUserType>(
        `/Account/GetInfo`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async updateInfo(
    edit: ProfileUserEditRequestType
  ): Promise<ApiResponse<AppUserType>> {
    try {
      const response = await apiService.put<AppUserType>(
        `/Account/UpdateProfile`,
        edit
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async changePassword(
    vm: ChangePasswordViewModelType
  ): Promise<ApiResponse<AppUserType>> {
    try {
      const response = await apiService.put<AppUserType>(
        `/Account/UpdateProfile/ChangePassword`,
        vm
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async adminChangePassword(vm: ChangePasswordViewModelType) : Promise<ApiResponse<AppUserType>> {
    try {
      const response = await apiService.put<AppUserType>(`/Account/UpdateProfile/AdminChangePassword`, vm);
      return response;
    } catch (error) {
      throw error;
    }
  }

  
  public async resetPasswordById(
    id: string
  ): Promise<ApiResponse<string>> {
    try {
      const response = await apiService.get<string>(
        `/Account/ResetPassword?id=${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default AccountServiceGenerated;
