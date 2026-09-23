import WeeklyConfigServiceGenerated from "../generated/weeklyConfigService.generated";

class WeeklyConfigService extends WeeklyConfigServiceGenerated {
  private static _instance: WeeklyConfigService;
  public static get instance(): WeeklyConfigService {
    if (!WeeklyConfigService._instance) {
      WeeklyConfigService._instance = new WeeklyConfigService();
    }
    return WeeklyConfigService._instance;
  }
}
const weeklyConfigService = WeeklyConfigService.instance;
export default weeklyConfigService;
