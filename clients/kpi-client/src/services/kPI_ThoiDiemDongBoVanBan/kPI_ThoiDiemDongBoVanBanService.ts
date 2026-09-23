import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_ThoiDiemDongBoVanBanCreateOrUpdateType,
  KPI_ThoiDiemDongBoVanBanSearchType,
  KPI_ThoiDiemDongBoVanBanType,
} from "@/types/kPI_ThoiDiemDongBoVanBan/kPI_ThoiDiemDongBoVanBan";

class KPI_ThoiDiemDongBoVanBanService {
  private static _instance: KPI_ThoiDiemDongBoVanBanService;
  public static get instance(): KPI_ThoiDiemDongBoVanBanService {
    if (!KPI_ThoiDiemDongBoVanBanService._instance) {
      KPI_ThoiDiemDongBoVanBanService._instance = new KPI_ThoiDiemDongBoVanBanService();
    }
    return KPI_ThoiDiemDongBoVanBanService._instance;
  }

  public async getData(
    searchData: KPI_ThoiDiemDongBoVanBanSearchType
  ): Promise<Response<ResponsePageList<KPI_ThoiDiemDongBoVanBanType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_ThoiDiemDongBoVanBanType[]>>
    >("/kPI_ThoiDiemDongBoVanBan/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_ThoiDiemDongBoVanBanCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_ThoiDiemDongBoVanBan/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_ThoiDiemDongBoVanBanCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_ThoiDiemDongBoVanBan/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_ThoiDiemDongBoVanBan/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_ThoiDiemDongBoVanBan/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_ThoiDiemDongBoVanBanSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_ThoiDiemDongBoVanBan/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_ThoiDiemDongBoVanBan/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_ThoiDiemDongBoVanBan/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_ThoiDiemDongBoVanBan/importExcel",
      form
    );
    return response as any;
  }


}

const kPI_ThoiDiemDongBoVanBanService = KPI_ThoiDiemDongBoVanBanService.instance;
export default kPI_ThoiDiemDongBoVanBanService;
