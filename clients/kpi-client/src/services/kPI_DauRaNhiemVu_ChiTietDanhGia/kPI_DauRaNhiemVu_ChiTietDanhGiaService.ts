import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType,
  KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType,
  KPI_DauRaNhiemVu_ChiTietDanhGiaType,
} from "@/types/kPI_DauRaNhiemVu_ChiTietDanhGia/kPI_DauRaNhiemVu_ChiTietDanhGia";

class KPI_DauRaNhiemVu_ChiTietDanhGiaService {
  private static _instance: KPI_DauRaNhiemVu_ChiTietDanhGiaService;
  public static get instance(): KPI_DauRaNhiemVu_ChiTietDanhGiaService {
    if (!KPI_DauRaNhiemVu_ChiTietDanhGiaService._instance) {
      KPI_DauRaNhiemVu_ChiTietDanhGiaService._instance = new KPI_DauRaNhiemVu_ChiTietDanhGiaService();
    }
    return KPI_DauRaNhiemVu_ChiTietDanhGiaService._instance;
  }

  public async getData(
    searchData: KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType
  ): Promise<Response<ResponsePageList<KPI_DauRaNhiemVu_ChiTietDanhGiaType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_DauRaNhiemVu_ChiTietDanhGiaType[]>>
    >("/kPI_DauRaNhiemVu_ChiTietDanhGia/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_DauRaNhiemVu_ChiTietDanhGia/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_DauRaNhiemVu_ChiTietDanhGia/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_DauRaNhiemVu_ChiTietDanhGia/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_DauRaNhiemVu_ChiTietDanhGia/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_DauRaNhiemVu_ChiTietDanhGia/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_DauRaNhiemVu_ChiTietDanhGia/exportTemplateImport"
    );
    return response as any;
  }

  public async getByPhieu(
    idPhieu: string
  ): Promise<Response<KPI_DauRaNhiemVu_ChiTietDanhGiaType[]>> {
    const response = await apiService.get<
      Response<KPI_DauRaNhiemVu_ChiTietDanhGiaType[]>
    >(`/kPI_DauRaNhiemVu_ChiTietDanhGia/GetByPhieu/${idPhieu}`);
    return response as any;
  }

  public async saveBatch(payload: {
    idPhieuDanhGia: string;
    vaiTroDanhGia: string;
    nguoiDanhGiaId?: string;
    items: any[];
  }): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_DauRaNhiemVu_ChiTietDanhGia/SaveBatch",
      payload
    );
    return response as any;
  }
}

const kPI_DauRaNhiemVu_ChiTietDanhGiaService = KPI_DauRaNhiemVu_ChiTietDanhGiaService.instance;
export default kPI_DauRaNhiemVu_ChiTietDanhGiaService;
