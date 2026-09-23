import RoleServiceGenerated from "../generated/roleService.generated";

class RoleService extends RoleServiceGenerated {
  private static _instance: RoleService;

  public static get instance(): RoleService {
    if (!RoleService._instance) {
      RoleService._instance = new RoleService();
    }
    return RoleService._instance;
  }
}

const roleService = RoleService.instance;
export default roleService;
