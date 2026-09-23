import OperationServiceGenerated from "../generated/operationService.generated";

class OperationService extends OperationServiceGenerated {
  private static _instance: OperationService;
  public static get instance(): OperationService {
    if (!OperationService._instance) {
      OperationService._instance = new OperationService();
    }
    return OperationService._instance;
  }
}

const operationService = OperationService.instance;
export default operationService;
