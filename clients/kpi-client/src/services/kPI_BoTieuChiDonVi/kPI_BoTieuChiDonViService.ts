import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_BoTieuChiDonViCreateOrUpdateType,
  KPI_BoTieuChiDonViSearchType,
  KPI_BoTieuChiDonViType,
} from "@/types/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonVi";

class KPI_BoTieuChiDonViService {
  private static _instance: KPI_BoTieuChiDonViService;
  public static get instance(): KPI_BoTieuChiDonViService {
    if (!KPI_BoTieuChiDonViService._instance) {
      KPI_BoTieuChiDonViService._instance = new KPI_BoTieuChiDonViService();
    }
    return KPI_BoTieuChiDonViService._instance;
  }

  public async getData(
    searchData: KPI_BoTieuChiDonViSearchType
  ): Promise<Response<ResponsePageList<KPI_BoTieuChiDonViType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_BoTieuChiDonViType[]>>
    >("/kPI_BoTieuChiDonVi/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_BoTieuChiDonViCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_BoTieuChiDonVi/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_BoTieuChiDonViCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_BoTieuChiDonVi/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_BoTieuChiDonVi/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_BoTieuChiDonVi/getDropDowns"
    );
    return response as any;
  }

  public async getDropdown(idDonVi?: string): Promise<Response<DropdownOption[]>> {
    const url = idDonVi ? `/kPI_BoTieuChiDonVi/getDropdown?idDonVi=${idDonVi}` : `/kPI_BoTieuChiDonVi/getDropdown`;
    const response = await apiService.get<Response<DropdownOption[]>>(url);
    return response as any;
  }

  public async getById(id: string): Promise<Response<KPI_BoTieuChiDonViType>> {
    const response = await apiService.get<Response<KPI_BoTieuChiDonViType>>(
      "/kPI_BoTieuChiDonVi/Get/" + id
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_BoTieuChiDonViSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_BoTieuChiDonVi/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_BoTieuChiDonVi/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_BoTieuChiDonVi/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_BoTieuChiDonVi/importExcel",
      form
    );
    return response as any;
  }

  public async clone(id: string, body?: { tenBoTieuChiDonVi?: string; idDonVi?: string; idDot?: string }): Promise<Response> {
    const response = await apiService.post<Response>(
      `/kPI_BoTieuChiDonVi/clone/${id}`,
      body || {}
    );
    return response as any;
  }

  public async toggleLock(id: string): Promise<Response> {
    const response = await apiService.post<Response>(
      `/kPI_BoTieuChiDonVi/toggleLock/${id}`,
      {}
    );
    return response as any;
  }
}

const kPI_BoTieuChiDonViService = KPI_BoTieuChiDonViService.instance;
export default kPI_BoTieuChiDonViService;
