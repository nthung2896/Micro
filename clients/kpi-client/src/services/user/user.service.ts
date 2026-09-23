import AspNetUsersServiceGenerated from "../generated/aspNetUsersService.generated";
import { apiService } from "../index";

class UserService extends AspNetUsersServiceGenerated {
  private static _instance: UserService;
  public static get instance(): UserService {
    if (!UserService._instance) {
      UserService._instance = new UserService();
    }
    return UserService._instance;
  }

  public async createChuyenVien(model: any) {
    const res = await apiService.post<any>(
      `/AspNetUsers/CreateChuyenVien`,
      model,
    );
    return res;
  }

  public async createCucTruongAccountForDepartments() {
    return await apiService.post<any>(`/AspNetUsers/CreateCucTruongAccountForDepartments`);
  }

  public async createPhoCucTruongAccountForDepartments() {
    return await apiService.post<any>(`/AspNetUsers/CreatePhoCucTruongAccountForDepartments`);
  }

  public async createTruongPhongAccountForDepartments() {
    return await apiService.post<any>(`/AspNetUsers/CreateTruongPhongAccountForDepartments`);
  }

  public async createPhoTruongPhongAccountForDepartments() {
    return await apiService.post<any>(`/AspNetUsers/CreatePhoTruongPhongAccountForDepartments`);
  }

  public async createQuickAccountForDepartments() {
    return await apiService.post<any>(`/AspNetUsers/CreateQuickAccountForDepartments`);
  }

  public async createAllLeadershipAccounts() {
    return await apiService.post<any>(`/AspNetUsers/CreateAllLeadershipAccounts`);
  }
}

const userService = UserService.instance;
export default userService;