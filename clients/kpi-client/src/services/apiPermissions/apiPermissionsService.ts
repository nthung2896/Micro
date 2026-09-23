import ApiPermissionsServiceGenerated from "../generated/apiPermissionsService.generated";
import DM_DuLieuDanhMucServiceGenerated from "../generated/dM_DuLieuDanhMucService.generated";

class ApiPermissionsService extends ApiPermissionsServiceGenerated {
  private static _instance: ApiPermissionsService;
  public static get instance(): ApiPermissionsService {
    if (!ApiPermissionsService._instance) {
      ApiPermissionsService._instance = new ApiPermissionsService();
    }
    return ApiPermissionsService._instance;
  }
}

const apiPermissionsService = ApiPermissionsService.instance;
export default apiPermissionsService;
