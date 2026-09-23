import { AppUserType } from "@/types/appUser/dto";
import AccountServiceGenerated from "../generated/accountService.generated";
import { ApiResponse } from "@/types/general";
import { apiService } from "..";

class AuthService extends AccountServiceGenerated {
  private static _instance: AuthService;
  public static get instance(): AuthService {
    if (!AuthService._instance) {
      AuthService._instance = new AuthService();
    }
    return AuthService._instance;
  }
  public async updateAvatar(
    avatar: FormData,
  ): Promise<ApiResponse<AppUserType>> {
    try {
      const response = await apiService.put<AppUserType>(
        `/Account/UpdateProfile/UpdateAvatar`,
        avatar,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getSsoLogoutUrl(
    idTokenHint: string,
  ): Promise<ApiResponse<{ url: string }>> {
    try {
      const response = await apiService.get<{ url: string }>(
        `/SsoKeycloak/LogoutUrl?idTokenHint=${encodeURIComponent(idTokenHint)}`,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}
const authService = AuthService.instance;
export default authService;
