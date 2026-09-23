import { apiService } from "@/services";
import {
  DataImport,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_VanBanDiCreateOrUpdateType,
  KPI_VanBanDiSearchType,
  KPI_VanBanDiType,
} from "@/types/kPI_VanBanDi/kPI_VanBanDi";

class KPI_VanBanDiService {
  private static _instance: KPI_VanBanDiService;
  public static get instance(): KPI_VanBanDiService {
    if (!KPI_VanBanDiService._instance) {
      KPI_VanBanDiService._instance = new KPI_VanBanDiService();
    }
    return KPI_VanBanDiService._instance;
  }

  public async getData(
    searchData: KPI_VanBanDiSearchType
  ): Promise<Response<ResponsePageList<KPI_VanBanDiType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_VanBanDiType[]>>
    >("/kPI_VanBanDi/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_VanBanDiCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_VanBanDi/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_VanBanDiCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_VanBanDi/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_VanBanDi/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_VanBanDi/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_VanBanDiSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_VanBanDi/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_VanBanDi/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_VanBanDi/import");
    return response as any;
  }

  public async saveImport(form: DataImport): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_VanBanDi/importExcel",
      form
    );
    return response as any;
  }


}

const kPI_VanBanDiService = KPI_VanBanDiService.instance;
export default kPI_VanBanDiService;
