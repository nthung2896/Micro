import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_DotDanhGia_DonViCreateOrUpdateType,
  KPI_DotDanhGia_DonViSearchType,
  KPI_DotDanhGia_DonViType,
} from "@/types/kPI_DotDanhGia_DonVi/kPI_DotDanhGia_DonVi";

class KPI_DotDanhGia_DonViService {
  private static _instance: KPI_DotDanhGia_DonViService;
  public static get instance(): KPI_DotDanhGia_DonViService {
    if (!KPI_DotDanhGia_DonViService._instance) {
      KPI_DotDanhGia_DonViService._instance = new KPI_DotDanhGia_DonViService();
    }
    return KPI_DotDanhGia_DonViService._instance;
  }

  public async getData(
    searchData: KPI_DotDanhGia_DonViSearchType
  ): Promise<Response<ResponsePageList<KPI_DotDanhGia_DonViType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_DotDanhGia_DonViType[]>>
    >("/kPI_DotDanhGia_DonVi/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_DotDanhGia_DonViCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_DotDanhGia_DonVi/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_DotDanhGia_DonViCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_DotDanhGia_DonVi/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_DotDanhGia_DonVi/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_DotDanhGia_DonVi/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_DotDanhGia_DonViSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_DotDanhGia_DonVi/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_DotDanhGia_DonVi/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_DotDanhGia_DonVi/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_DotDanhGia_DonVi/importExcel",
      form
    );
    return response as any;
  }


}

const kPI_DotDanhGia_DonViService = KPI_DotDanhGia_DonViService.instance;
export default kPI_DotDanhGia_DonViService;
