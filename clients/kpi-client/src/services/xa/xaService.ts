import { apiService } from "@/services";
import {
  ApiResponse,
  DataToSend,
  Dictionary,
  DropdownOption,
  PagedList,
} from "@/types/general";
import {
  XaCreateOrUpdateType,
  XaSearchType,
  XaType,
} from "@/types/xa/xa";

class XaService {
  private static _instance: XaService;
  public static get instance(): XaService {
    if (!XaService._instance) {
      XaService._instance = new XaService();
    }
    return XaService._instance;
  }

  public async getData(
    searchData: XaSearchType
  ): Promise<ApiResponse<PagedList<XaType>>> {
    const response = await apiService.post<PagedList<XaType>>(
      "/Xa/GetData",
      searchData
    );
    return response;
  }

  public async create(
    formData: XaCreateOrUpdateType
  ): Promise<ApiResponse<XaType>> {
    const response = await apiService.post<XaType>(
      "/Xa/Create",
      formData
    );
    return response;
  }

  public async update(
    formData: XaCreateOrUpdateType
  ): Promise<ApiResponse<XaType>> {
    const response = await apiService.put<XaType>(
      "/Xa/Update",
      formData
    );
    return response;
  }

  public async delete(id: string): Promise<ApiResponse> {
    const response = await apiService.delete(
      "/Xa/Delete/" + id
    );
    return response;
  }

  public async getDropdowns(): Promise<ApiResponse<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Dictionary<DropdownOption[]>>(
      "/Xa/GetDropDowns"
    );
    return response;
  }

  public async exportExcel(
    search: XaSearchType
  ): Promise<ApiResponse<string>> {
    const response = await apiService.post<string>(
      "/Xa/ExportExcel",
      search
    );
    return response;
  }

  public async exportTemplateImport(): Promise<ApiResponse> {
    const response = await apiService.get(
      "/Xa/ExportTemplateImport"
    );
    return response;
  }

  public async getDataImportView(): Promise<ApiResponse> {
    const response = await apiService.get("/Xa/Import");
    return response;
  }

  public async saveImport(form: DataToSend): Promise<ApiResponse> {
    const response = await apiService.post(
      "/Xa/ImportExcel",
      form
    );
    return response;
  }
}

const xaService = XaService.instance;
export default xaService;
