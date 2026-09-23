import HistoryChangedAuthencationContractServiceGenerated from "../generated/historyChangedAuthencationContractService.generated";

class HistoryChangedAuthencationContractService extends HistoryChangedAuthencationContractServiceGenerated {
  private static _instance: HistoryChangedAuthencationContractService;

  public static get instance(): HistoryChangedAuthencationContractService {
    if (!HistoryChangedAuthencationContractService._instance) {
      HistoryChangedAuthencationContractService._instance =
        new HistoryChangedAuthencationContractService();
    }
    return HistoryChangedAuthencationContractService._instance;
  }
}

const historyChangedAuthencationContractService =
  HistoryChangedAuthencationContractService.instance;

export default historyChangedAuthencationContractService;
