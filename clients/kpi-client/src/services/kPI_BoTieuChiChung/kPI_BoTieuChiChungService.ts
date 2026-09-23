import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_BoTieuChiChungCreateOrUpdateType,
  KPI_BoTieuChiChungSearchType,
  KPI_BoTieuChiChungType,
} from "@/types/kPI_BoTieuChiChung/kPI_BoTieuChiChung";

class KPI_BoTieuChiChungService {
  private static _instance: KPI_BoTieuChiChungService;
  public static get instance(): KPI_BoTieuChiChungService {
    if (!KPI_BoTieuChiChungService._instance) {
      KPI_BoTieuChiChungService._instance = new KPI_BoTieuChiChungService();
    }
    return KPI_BoTieuChiChungService._instance;
  }

  public async getData(
    searchData: KPI_BoTieuChiChungSearchType
  ): Promise<Response<ResponsePageList<KPI_BoTieuChiChungType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_BoTieuChiChungType[]>>
    >("/KPI_BoTieuChiChung/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_BoTieuChiChungCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/KPI_BoTieuChiChung/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_BoTieuChiChungCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/KPI_BoTieuChiChung/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/KPI_BoTieuChiChung/delete/" + id
    );
    return response as any;
  }

  public async toggleActive(id: string): Promise<Response> {
    const response = await apiService.post<Response>(
      "/KPI_BoTieuChiChung/ToggleActive/" + id,
      {}
    );
    return response as any;
  }

  public async getById(id: string): Promise<Response<KPI_BoTieuChiChungType>> {
    const response = await apiService.get<Response<KPI_BoTieuChiChungType>>(
      "/KPI_BoTieuChiChung/Get/" + id
    );
    return response as any;
  }

  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/KPI_BoTieuChiChung/getDropDowns"
    );
    return response as any;
  }

  public async getDropdown(idDonVi?: string, onlyActive?: boolean, type?: string): Promise<Response<DropdownOption[]>> {
    const params = new URLSearchParams();
    if (idDonVi) params.append("idDonVi", idDonVi);
    if (onlyActive !== undefined) params.append("onlyActive", String(onlyActive));
    if (type) params.append("type", type);
    const qs = params.toString();
    const url = qs ? `/KPI_BoTieuChiChung/getDropdown?${qs}` : `/KPI_BoTieuChiChung/getDropdown`;
    const response = await apiService.get<Response<DropdownOption[]>>(url);
    return response as any;
  }

  public async exportExcel(
    search: KPI_BoTieuChiChungSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/KPI_BoTieuChiChung/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/KPI_BoTieuChiChung/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_BoTieuChiChung/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/KPI_BoTieuChiChung/importExcel",
      form
    );
    return response as any;
  }

  public async clone(
    id: string,
    formData: KPI_BoTieuChiChungCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/KPI_BoTieuChiChung/Clone/" + id,
      formData
    );
    return response as any;
  }

  public async checkFileWorksheet(file: File): Promise<Response<string[]>> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiService.post<Response<string[]>>(
      "/KPI_BoTieuChiChung/CheckFileWorksheet",
      formData
    );
    return response as any;
  }

  public async getHeaderWorksheet(file: File, workSheetName?: string): Promise<Response<any>> {
    const formData = new FormData();
    formData.append("file", file);
    if (workSheetName) {
      formData.append("WorkSheetName", workSheetName);
    }
    const response = await apiService.post<Response<any>>(
      "/KPI_BoTieuChiChung/GetHeaderWorksheet",
      formData
    );
    return response as any;
  }

  public async importExcelDirect(
    file: File,
    data: any
  ): Promise<Response<any>> {
    const formData = new FormData();
    formData.append("file", file);
    if (data) {
      if (data.RowStart !== undefined && data.RowStart !== null) {
        formData.append("RowStart", data.RowStart.toString());
      }
      if (data.RowName !== undefined && data.RowName !== null) {
        formData.append("RowName", data.RowName.toString());
      }
      if (data.RowInfo !== undefined && data.RowInfo !== null) {
        formData.append("RowInfo", data.RowInfo.toString());
      }
      if (data.IdDonVi) {
        formData.append("IdDonVi", data.IdDonVi);
      }
      if (data.IdDot) {
        formData.append("IdDot", data.IdDot);
      }
      if (data.ApDungTuNgay) {
        formData.append("ApDungTuNgay", data.ApDungTuNgay);
      }
      if (data.ApDungToiNgay) {
        formData.append("ApDungToiNgay", data.ApDungToiNgay);
      }
      if (data.SoQuyetDinh) {
        formData.append("SoQuyetDinh", data.SoQuyetDinh);
      }
      if (data.NgayQuyetDinh) {
        formData.append("NgayQuyetDinh", data.NgayQuyetDinh);
      }
      if (data.TenBoTieuChiDonVi) {
        formData.append("TenBoTieuChiDonVi", data.TenBoTieuChiDonVi);
      }
      if (data.WorkSheetName) {
        formData.append("WorkSheetName", data.WorkSheetName);
      }
    }
    const response = await apiService.post<Response<any>>(
      "/KPI_BoTieuChiChung/ImportExcelDirect",
      formData
    );
    return response as any;
  }
}

const kPI_BoTieuChiChungService = KPI_BoTieuChiChungService.instance;
export default kPI_BoTieuChiChungService;

