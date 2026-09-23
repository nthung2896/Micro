import { apiService } from "@/services";
import {
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_LyLich2CCreateOrUpdateType,
  KPI_LyLich2CSearchType,
  KPI_LyLich2CType,
} from "@/types/kPI_LyLich2C/kPI_LyLich2C";

class KPI_LyLich2CService {
  private static _instance: KPI_LyLich2CService;
  public static get instance(): KPI_LyLich2CService {
    if (!KPI_LyLich2CService._instance) {
      KPI_LyLich2CService._instance = new KPI_LyLich2CService();
    }
    return KPI_LyLich2CService._instance;
  }

  public async getData(
    searchData: KPI_LyLich2CSearchType
  ): Promise<Response<ResponsePageList<KPI_LyLich2CType[]>>> {
    const response = await apiService.post<
      ResponsePageList<KPI_LyLich2CType[]>
    >("/kPI_LyLich2C/getData", searchData);
    return response as any; // response from apiService is ApiResponse, which maps to Response
  }

  public async getById(id: string): Promise<Response<KPI_LyLich2CType>> {
    const response = await apiService.get<Response<KPI_LyLich2CType>>(
      "/kPI_LyLich2C/Get/" + id
    );
    return response as any;
  }

  public async getByUserId(id: string): Promise<Response<KPI_LyLich2CType>> {
    const response = await apiService.get<Response<KPI_LyLich2CType>>(
      "/kPI_LyLich2C/GetByUserId/" + id
    );
    return response as any;
  }

  public async create(
    formData: KPI_LyLich2CCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_LyLich2C/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_LyLich2CCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_LyLich2C/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_LyLich2C/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_LyLich2C/getDropDowns"
    );
    return response as any;
  }

  public async getDropdown(): Promise<DropdownOption[]> {
    try {
      const response = await apiService.get<any>("/kPI_LyLich2C/GetDropdown");
      if (response && response.data) {
        const data = response.data.data || response.data;
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Fallback nếu API GetDropdown 404/rỗng
    try {
      const resData = await apiService.post<any>("/kPI_LyLich2C/GetData", {
        pageIndex: 1,
        pageSize: 1000,
      });
      const items = resData?.data?.items || resData?.data?.data?.items || [];
      return items.map((x: any) => ({
        value: x.id,
        label: x.hoTen ? `${x.hoTen}${x.maCanBo ? ` (${x.maCanBo})` : ""}` : x.id,
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  public async exportExcel(
    search: KPI_LyLich2CSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_LyLich2C/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_LyLich2C/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_LyLich2C/import");
    return response as any;
  }

  public async saveImport(form: any): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_LyLich2C/importExcel",
      form
    );
    return response as any;
  }

  public async importData(formData: FormData, donViSuDungId: string): Promise<Response> {
    const response = await apiService.post<Response>(
      `/kPI_LyLich2C/ImportExcelDirect?donViSuDungId=${donViSuDungId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response as any;
  }

  public async createAccountByLyLichId(id: string): Promise<Response> {
    const response = await apiService.post<Response>(
      `/kPI_LyLich2C/CreateAccountByLyLichId/${id}`
    );
    return response as any;
  }

  public async createAccountForAll(): Promise<Response> {
    const response = await apiService.post<Response>(
      `/kPI_LyLich2C/CreateAccountForAll`
    );
    return response as any;
  }
}

export const kPI_LyLich2CService = KPI_LyLich2CService.instance;
export default kPI_LyLich2CService;
