import ModuleServiceGenerated from "../generated/moduleService.generated";

// Kế thừa lại các hàm của class ModuleServiceGenerated
class ModuleService extends ModuleServiceGenerated {
  private static _instance: ModuleService;

  public static get instance(): ModuleService {
    if (!ModuleService._instance) {
      ModuleService._instance = new ModuleService();
    }
    return ModuleService._instance;
  }

  // Viết thêm các hàm custom cho moduleService ở đây
}

const moduleService = ModuleService.instance;
export default moduleService;
