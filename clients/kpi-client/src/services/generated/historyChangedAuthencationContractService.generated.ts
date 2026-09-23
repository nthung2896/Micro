import {
  HistoryChangedAuthencationContractType,
} from "@/types/historyChangedAuthencationContract/dto";
import {
  HistoryChangedAuthenticationContractRequestType,
  HistoryChangedAuthenticationContractSearchType,
} from "@/types/historyChangedAuthencationContract/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class HistoryChangedAuthencationContractServiceGenerated {
  public async createData(
    request: HistoryChangedAuthenticationContractRequestType
  ): Promise<ApiResponse<HistoryChangedAuthencationContractType>> {
    try {
      const response = await apiService.post<HistoryChangedAuthencationContractType>(
        `/HistoryChangedAuthencationContract/CreateData?request=${request}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: HistoryChangedAuthenticationContractSearchType
  ): Promise<ApiResponse<PagedList<HistoryChangedAuthencationContractType>>> {
    try {
      const response = await apiService.post<PagedList<HistoryChangedAuthencationContractType>>(
        `/HistoryChangedAuthencationContract/GetData`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default HistoryChangedAuthencationContractServiceGenerated;
