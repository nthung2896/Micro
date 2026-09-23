import RoleOperationServiceGenerated from "../generated/roleOperationService.generated";

class RoleOperationService extends RoleOperationServiceGenerated {
  private static _instance: RoleOperationService;

  public static get instance(): RoleOperationService {
    if (!RoleOperationService._instance) {
      RoleOperationService._instance = new RoleOperationService();
    }
    return RoleOperationService._instance;
  }
}

const roleOperationService = RoleOperationService.instance;
export default roleOperationService;
