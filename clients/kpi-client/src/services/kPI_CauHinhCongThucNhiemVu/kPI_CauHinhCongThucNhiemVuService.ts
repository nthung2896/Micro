import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_CauHinhCongThucNhiemVuCreateOrUpdateType,
  KPI_CauHinhCongThucNhiemVuSearchType,
  KPI_CauHinhCongThucNhiemVuType,
} from "@/types/kPI_CauHinhCongThucNhiemVu/kPI_CauHinhCongThucNhiemVu";

class KPI_CauHinhCongThucNhiemVuService {
  private static _instance: KPI_CauHinhCongThucNhiemVuService;
  public static get instance(): KPI_CauHinhCongThucNhiemVuService {
    if (!KPI_CauHinhCongThucNhiemVuService._instance) {
      KPI_CauHinhCongThucNhiemVuService._instance = new KPI_CauHinhCongThucNhiemVuService();
    }
    return KPI_CauHinhCongThucNhiemVuService._instance;
  }

  public async getData(
    searchData: KPI_CauHinhCongThucNhiemVuSearchType
  ): Promise<Response<ResponsePageList<KPI_CauHinhCongThucNhiemVuType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_CauHinhCongThucNhiemVuType[]>>
    >("/kPI_CauHinhCongThucNhiemVu/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_CauHinhCongThucNhiemVuCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_CauHinhCongThucNhiemVu/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_CauHinhCongThucNhiemVuCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_CauHinhCongThucNhiemVu/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_CauHinhCongThucNhiemVu/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_CauHinhCongThucNhiemVu/getDropDowns"
    );
    return response as any;
  }

  public async getKpiColumns(tableName: string): Promise<Response<string[]>> {
    const response = await apiService.get<Response<string[]>>(
      `/KPI_CauHinhCongThucNhiemVu/GetKpiColumns?tableName=${tableName}`
    );
    return response as any;
  }

  public async getKpiTables(): Promise<Response<string[]>> {
    const response = await apiService.get<Response<string[]>>(
      "/KPI_CauHinhCongThucNhiemVu/GetKpiTables"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_CauHinhCongThucNhiemVuSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_CauHinhCongThucNhiemVu/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_CauHinhCongThucNhiemVu/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_CauHinhCongThucNhiemVu/import");
    return response as any;
  }

  public async getFormula(
    targetTable: string,
    targetColumn: string,
    idDotDanhGia?: string,
    idDonVi?: string
  ): Promise<Response<KPI_CauHinhCongThucNhiemVuType>> {
    const response = await apiService.get<Response<KPI_CauHinhCongThucNhiemVuType>>(
      `/kPI_CauHinhCongThucNhiemVu/GetFormula?targetTable=${targetTable}&targetColumn=${targetColumn}${
        idDotDanhGia ? `&idDotDanhGia=${idDotDanhGia}` : ""
      }${idDonVi ? `&idDonVi=${idDonVi}` : ""}`
    );
    return response as any;
  }

  public async calculateFormulaV2(
    id: string,
    parameters: any
  ): Promise<Response<number>> {
    const response = await apiService.post<Response<number>>(
      `/kPI_CauHinhCongThucNhiemVu/CalculateFormulaV2`,
      { id, parameters }
    );
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_CauHinhCongThucNhiemVu/importExcel",
      form
    );
    return response as any;
  }


}

const kPI_CauHinhCongThucNhiemVuService = KPI_CauHinhCongThucNhiemVuService.instance;
export default kPI_CauHinhCongThucNhiemVuService;
