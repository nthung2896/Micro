import HuyenServiceGenerated from "../generated/huyenService.generated";

class HuyenService extends HuyenServiceGenerated {
  private static _instance: HuyenService;

  public static get instance(): HuyenService {
    if (!HuyenService._instance) {
      HuyenService._instance = new HuyenService();
    }
    return HuyenService._instance;
  }
}

const huyenService = HuyenService.instance;
export default huyenService;
