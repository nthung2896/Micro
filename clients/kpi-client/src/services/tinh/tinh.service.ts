import TinhServiceGenerated from "../generated/tinhService.generated";

class TinhService extends TinhServiceGenerated {
  private static _instance: TinhService;

  public static get instance(): TinhService {
    if (!TinhService._instance) {
      TinhService._instance = new TinhService();
    }
    return TinhService._instance;
  }
}

const tinhService = TinhService.instance;
export default tinhService;
