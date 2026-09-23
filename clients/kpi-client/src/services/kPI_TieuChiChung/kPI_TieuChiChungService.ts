import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_TieuChiChungCreateOrUpdateType,
  KPI_TieuChiChungSearchType,
  KPI_TieuChiChungType,
} from "@/types/kPI_TieuChiChung/kPI_TieuChiChung";

class KPI_TieuChiChungService {
  private static _instance: KPI_TieuChiChungService;
  public static get instance(): KPI_TieuChiChungService {
    if (!KPI_TieuChiChungService._instance) {
      KPI_TieuChiChungService._instance = new KPI_TieuChiChungService();
    }
    return KPI_TieuChiChungService._instance;
  }

  public async getData(
    searchData: KPI_TieuChiChungSearchType
  ): Promise<Response<ResponsePageList<KPI_TieuChiChungType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_TieuChiChungType[]>>
    >("/kPI_TieuChiChung/getData", searchData);
    return response as any;
  }

  public async getTreeDataForDot(
    idDot: string,
    idLyLich?: string | null,
    idPhieuDanhGia?: string | null,
    idDonVi?: string | null
  ): Promise<Response<any[]>> {
    let url = `/kPI_TieuChiChung/getTreeDataForDot?idDot=${idDot}`;
    if (idLyLich) {
      url += `&idLyLich=${idLyLich}`;
    }
    if (idPhieuDanhGia) {
      url += `&idPhieuDanhGia=${idPhieuDanhGia}`;
    }
    if (idDonVi) {
      url += `&idDonVi=${idDonVi}`;
    }
    const response = await apiService.get<Response<any[]>>(url);
    return response as any;
  }

  public async create(
    formData: KPI_TieuChiChungCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_TieuChiChung/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_TieuChiChungCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_TieuChiChung/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_TieuChiChung/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_TieuChiChung/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_TieuChiChungSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_TieuChiChung/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_TieuChiChung/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_TieuChiChung/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_TieuChiChung/importExcel",
      form
    );
    return response as any;
  }


}

const kPI_TieuChiChungService = KPI_TieuChiChungService.instance;
export default kPI_TieuChiChungService;
