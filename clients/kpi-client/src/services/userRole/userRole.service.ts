import UserRoleServiceGenerated from "../generated/userRoleService.generated";

class UserRoleService extends UserRoleServiceGenerated {
  private static _instance: UserRoleService;

  public static get instance(): UserRoleService {
    if (!UserRoleService._instance) {
      UserRoleService._instance = new UserRoleService();
    }
    return UserRoleService._instance;
  }
}

const userRoleService = UserRoleService.instance;
export default userRoleService;
