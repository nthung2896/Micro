import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType,
  KPI_QuaTrinhXuLyPhieuDanhGiaSearchType,
  KPI_QuaTrinhXuLyPhieuDanhGiaType,
} from "@/types/kPI_QuaTrinhXuLyPhieuDanhGia/kPI_QuaTrinhXuLyPhieuDanhGia";

class KPI_QuaTrinhXuLyPhieuDanhGiaService {
  private static _instance: KPI_QuaTrinhXuLyPhieuDanhGiaService;
  public static get instance(): KPI_QuaTrinhXuLyPhieuDanhGiaService {
    if (!KPI_QuaTrinhXuLyPhieuDanhGiaService._instance) {
      KPI_QuaTrinhXuLyPhieuDanhGiaService._instance = new KPI_QuaTrinhXuLyPhieuDanhGiaService();
    }
    return KPI_QuaTrinhXuLyPhieuDanhGiaService._instance;
  }

  public async getData(
    searchData: KPI_QuaTrinhXuLyPhieuDanhGiaSearchType
  ): Promise<Response<ResponsePageList<KPI_QuaTrinhXuLyPhieuDanhGiaType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_QuaTrinhXuLyPhieuDanhGiaType[]>>
    >("/kPI_QuaTrinhXuLyPhieuDanhGia/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_QuaTrinhXuLyPhieuDanhGia/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_QuaTrinhXuLyPhieuDanhGia/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_QuaTrinhXuLyPhieuDanhGia/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_QuaTrinhXuLyPhieuDanhGia/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_QuaTrinhXuLyPhieuDanhGiaSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_QuaTrinhXuLyPhieuDanhGia/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_QuaTrinhXuLyPhieuDanhGia/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_QuaTrinhXuLyPhieuDanhGia/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_QuaTrinhXuLyPhieuDanhGia/importExcel",
      form
    );
    return response as any;
  }


}

const kPI_QuaTrinhXuLyPhieuDanhGiaService = KPI_QuaTrinhXuLyPhieuDanhGiaService.instance;
export default kPI_QuaTrinhXuLyPhieuDanhGiaService;
