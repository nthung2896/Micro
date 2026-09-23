import DM_NhomDanhMucServiceGenerated from "../generated/dM_NhomDanhMucService.generated";

class NhomDanhMucService extends DM_NhomDanhMucServiceGenerated {
  private static _instance: NhomDanhMucService;
  public static get instance(): NhomDanhMucService {
    if (!NhomDanhMucService._instance) {
      NhomDanhMucService._instance = new NhomDanhMucService();
    }
    return NhomDanhMucService._instance;
  }
}

const nhomDanhMucService = NhomDanhMucService.instance;
export default nhomDanhMucService;
