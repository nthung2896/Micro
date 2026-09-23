import HolidayConfigsServiceGenerated from "../generated/holidayConfigsService.generated";

class HolidayConfigsService extends HolidayConfigsServiceGenerated {
  private static _instance: HolidayConfigsService;
  public static get instance(): HolidayConfigsService {
    if (!HolidayConfigsService._instance) {
      HolidayConfigsService._instance = new HolidayConfigsService();
    }
    return HolidayConfigsService._instance;
  }
}
const holidayConfigsService = HolidayConfigsService.instance;
export default holidayConfigsService;
