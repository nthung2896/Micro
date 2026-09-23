import { apiService } from "@/services";
import {
  ApiResponse,
  DataToSend,
  Dictionary,
  DropdownOption,
  PagedList,
} from "@/types/general";
import {
  AppConfigurationCreateOrUpdateType,
  AppConfigurationSearchType,
  AppConfigurationType,
} from "@/types/appConfiguration/appConfiguration";

class AppConfigurationService {
  private static _instance: AppConfigurationService;
  public static get instance(): AppConfigurationService {
    if (!AppConfigurationService._instance) {
      AppConfigurationService._instance = new AppConfigurationService();
    }
    return AppConfigurationService._instance;
  }

  public async getData(
    searchData: AppConfigurationSearchType
  ): Promise<ApiResponse<PagedList<AppConfigurationType>>> {
    const response = await apiService.post<PagedList<AppConfigurationType>>(
      "/appConfiguration/getData",
      searchData
    );
    return response;
  }

  public async create(
    formData: AppConfigurationCreateOrUpdateType
  ): Promise<ApiResponse<AppConfigurationType>> {
    const response = await apiService.post<AppConfigurationType>(
      "/appConfiguration/create",
      formData
    );
    return response;
  }

  public async update(
    formData: AppConfigurationCreateOrUpdateType
  ): Promise<ApiResponse<AppConfigurationType>> {
    const response = await apiService.put<AppConfigurationType>(
      "/appConfiguration/update",
      formData
    );
    return response;
  }

  public async get(id: string): Promise<ApiResponse<AppConfigurationType>> {
    const response = await apiService.get<AppConfigurationType>(
      "/appConfiguration/get/" + id
    );
    return response;
  }

  public async getActiveConfig(): Promise<ApiResponse<AppConfigurationType>> {
    const response = await apiService.get<AppConfigurationType>(
      "/appConfiguration/getActiveConfig"
    );
    return response;
  }

  public async toggleActive(id: string): Promise<ApiResponse<AppConfigurationType>> {
    const response = await apiService.post<AppConfigurationType>(
      "/appConfiguration/toggleActive/" + id,
      {}
    );
    return response;
  }

  public async delete(id: string): Promise<ApiResponse<any>> {
    const response = await apiService.delete<any>(
      "/appConfiguration/delete/" + id
    );
    return response;
  }

  public async getDropdowns(): Promise<ApiResponse<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Dictionary<DropdownOption[]>>(
      "/appConfiguration/getDropDowns"
    );
    return response;
  }

  public async exportExcel(
    search: AppConfigurationSearchType
  ): Promise<ApiResponse<string>> {
    const response = await apiService.post<string>(
      "/appConfiguration/exportExcel",
      search
    );
    return response;
  }

  public async exportTemplateImport(): Promise<ApiResponse<any>> {
    const response = await apiService.get<any>(
      "/appConfiguration/exportTemplateImport"
    );
    return response;
  }

  public async getDataImportView(): Promise<ApiResponse<any>> {
    const response = await apiService.get<any>("/AppConfiguration/import");
    return response;
  }

  public async saveImport(form: DataToSend): Promise<ApiResponse<any>> {
    const response = await apiService.post<any>(
      "/appConfiguration/importExcel",
      form
    );
    return response;
  }
}

const appConfigurationService = AppConfigurationService.instance;
export default appConfigurationService;
