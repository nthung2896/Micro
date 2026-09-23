import { apiService } from "@/services";
import {
  DataImport,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_DotTheoDoiDanhGiaCloneType,
  KPI_DotTheoDoiDanhGiaCreateOrUpdateType,
  KPI_DotTheoDoiDanhGiaSearchType,
  KPI_DotTheoDoiDanhGiaType,
} from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";

class KPI_DotTheoDoiDanhGiaService {
  private static _instance: KPI_DotTheoDoiDanhGiaService;
  public static get instance(): KPI_DotTheoDoiDanhGiaService {
    if (!KPI_DotTheoDoiDanhGiaService._instance) {
      KPI_DotTheoDoiDanhGiaService._instance = new KPI_DotTheoDoiDanhGiaService();
    }
    return KPI_DotTheoDoiDanhGiaService._instance;
  }

  public async getData(
    searchData: KPI_DotTheoDoiDanhGiaSearchType
  ): Promise<Response<ResponsePageList<KPI_DotTheoDoiDanhGiaType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_DotTheoDoiDanhGiaType[]>>
    >("/kPI_DotTheoDoiDanhGia/getData", searchData);
    return response as any;
  }

  public async getById(id: string): Promise<Response<KPI_DotTheoDoiDanhGiaType>> {
    const response = await apiService.get<Response<KPI_DotTheoDoiDanhGiaType>>(
      "/kPI_DotTheoDoiDanhGia/Get/" + id
    );
    return response as any;
  }

  public async create(
    formData: KPI_DotTheoDoiDanhGiaCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_DotTheoDoiDanhGia/create",
      formData
    );
    return response as any;
  }

  public async clone(
    formData: KPI_DotTheoDoiDanhGiaCloneType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_DotTheoDoiDanhGia/clone",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_DotTheoDoiDanhGiaCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_DotTheoDoiDanhGia/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_DotTheoDoiDanhGia/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_DotTheoDoiDanhGia/getDropDowns"
    );
    return response as any;
  }

  // API riêng để lấy dropdown Đợt theo dõi đánh giá
  public async getListDotDanhGiaDropdown(activeOnly = false, type?: string): Promise<DropdownOption[]> {
    let url = `/kPI_DotTheoDoiDanhGia/getDropdownDotDanhGia?activeOnly=${activeOnly}`;
    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }
    const response = await apiService.get<DropdownOption[]>(url);
    return response.data || [];
  }

  public async exportExcel(
    search: KPI_DotTheoDoiDanhGiaSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_DotTheoDoiDanhGia/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_DotTheoDoiDanhGia/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_DotTheoDoiDanhGia/import");
    return response as any;
  }

  public async saveImport(form: DataImport): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_DotTheoDoiDanhGia/importExcel",
      form
    );
    return response as any;
  }


}

const kPI_DotTheoDoiDanhGiaService = KPI_DotTheoDoiDanhGiaService.instance;
export default kPI_DotTheoDoiDanhGiaService;
