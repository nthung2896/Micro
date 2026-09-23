import BCBaoCaoServiceGenerated from "../generated/bCBaoCaoService.generated";

class BCBaoCaoService extends BCBaoCaoServiceGenerated {
  private static _instance: BCBaoCaoService;

  public static get instance(): BCBaoCaoService {
    if (!BCBaoCaoService._instance) {
      BCBaoCaoService._instance = new BCBaoCaoService();
    }
    return BCBaoCaoService._instance;
  }
}

const bcBaoCaoService = BCBaoCaoService.instance;
export default bcBaoCaoService;
