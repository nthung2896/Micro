import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_VanBanDenCreateOrUpdateType,
  KPI_VanBanDenSearchType,
  KPI_VanBanDenType,
} from "@/types/kPI_VanBanDen/kPI_VanBanDen";

class KPI_VanBanDenService {
  private static _instance: KPI_VanBanDenService;
  public static get instance(): KPI_VanBanDenService {
    if (!KPI_VanBanDenService._instance) {
      KPI_VanBanDenService._instance = new KPI_VanBanDenService();
    }
    return KPI_VanBanDenService._instance;
  }

  public async getData(
    searchData: KPI_VanBanDenSearchType
  ): Promise<Response<ResponsePageList<KPI_VanBanDenType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_VanBanDenType[]>>
    >("/kPI_VanBanDen/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_VanBanDenCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_VanBanDen/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_VanBanDenCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_VanBanDen/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_VanBanDen/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_VanBanDen/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_VanBanDenSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_VanBanDen/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_VanBanDen/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_VanBanDen/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_VanBanDen/importExcel",
      form
    );
    return response as any;
  }


}

const kPI_VanBanDenService = KPI_VanBanDenService.instance;
export default kPI_VanBanDenService;
