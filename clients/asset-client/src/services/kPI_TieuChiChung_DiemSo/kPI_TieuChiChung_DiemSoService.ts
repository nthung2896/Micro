import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_TieuChiChung_DiemSoCreateOrUpdateType,
  KPI_TieuChiChung_DiemSoDanhSachKeThuaResponse,
  KPI_TieuChiChung_DiemSoSearchType,
  KPI_TieuChiChung_DiemSoType,
  KPI_TongHopTieuChiChungDto,
  KPI_TongHopToanCucDto,
  KPI_TongHopTieuChiChungSearchDto,
} from "@/types/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSo";

class KPI_TieuChiChung_DiemSoService {
  private static _instance: KPI_TieuChiChung_DiemSoService;
  public static get instance(): KPI_TieuChiChung_DiemSoService {
    if (!KPI_TieuChiChung_DiemSoService._instance) {
      KPI_TieuChiChung_DiemSoService._instance = new KPI_TieuChiChung_DiemSoService();
    }
    return KPI_TieuChiChung_DiemSoService._instance;
  }

  public async getData(
    searchData: KPI_TieuChiChung_DiemSoSearchType
  ): Promise<Response<ResponsePageList<KPI_TieuChiChung_DiemSoType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_TieuChiChung_DiemSoType[]>>
    >("/kPI_TieuChiChung_DiemSo/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_TieuChiChung_DiemSoCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_TieuChiChung_DiemSo/create",
      formData
    );
    return response as any;
  }

  /**
   * Lưu điểm tiêu chí chung - Luồng v1 (phiên bản cũ)
   */
  public async saveScores(data: {
    idLyLich: string,
    idDotDanhGia: string,
    uuDiem?: string,
    hanChe?: string,
    yKienNhanXet?: string,
    diemTieuChiChung?: number,
    tongDiem?: number,
    scores: { idTieuChiChung: string, diemTuCham: number }[]
  }): Promise<Response<string>> {
    const response = await apiService.post<Response<string>>(
      "/kPI_TieuChiChung_DiemSo/SaveScores",
      data
    );
    return response as any;
  }

  /**
   * Lưu điểm tiêu chí chung & đồng bộ phiếu - Luồng v2 (phiên bản mới / đa cấp)
   */
  public async saveScoresV2(data: {
    idPhieuDanhGia?: string,
    idLyLich?: string,
    idDotDanhGia?: string,
    uuDiem?: string,
    hanChe?: string,
    yKienNhanXet?: string,
    diemTieuChiChung?: number,
    diemThucHienNhiemVu?: number,
    tongDiem?: number,
    vaiTroDanhGia?: string,
    scores: { idTieuChiChung: string, diemTuCham: number }[]
  }): Promise<Response<string>> {
    const response = await apiService.post<Response<string>>(
      "/kPI_TieuChiChung_DiemSo/SaveScoresV2",
      data
    );
    return response as any;
  }

  public async getDanhSachKeThua(
    idDotDanhGia: string
  ): Promise<Response<KPI_TieuChiChung_DiemSoDanhSachKeThuaResponse>> {
    const response = await apiService.get<Response<KPI_TieuChiChung_DiemSoDanhSachKeThuaResponse>>(
      `/KPI_TieuChiChung_DiemSo/GetDanhSachKeThua?idDotDanhGia=${encodeURIComponent(idDotDanhGia)}`
    );
    return response as any;
  }

  public async update(
    formData: KPI_TieuChiChung_DiemSoCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_TieuChiChung_DiemSo/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_TieuChiChung_DiemSo/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_TieuChiChung_DiemSo/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_TieuChiChung_DiemSoSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_TieuChiChung_DiemSo/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_TieuChiChung_DiemSo/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_TieuChiChung_DiemSo/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_TieuChiChung_DiemSo/importExcel",
      form
    );
    return response as any;
  }

  public async getTongHopTieuChi(
    searchData: KPI_TongHopTieuChiChungSearchDto
  ): Promise<Response<KPI_TongHopTieuChiChungDto>> {
    const response = await apiService.post<Response<KPI_TongHopTieuChiChungDto>>(
      "/kPI_TieuChiChung_DiemSo/GetTongHopTieuChi",
      searchData
    );
    return response as any;
  }

  public async getTongHopToanCuc(
    searchData: KPI_TongHopTieuChiChungSearchDto
  ): Promise<Response<KPI_TongHopToanCucDto>> {
    const response = await apiService.post<Response<KPI_TongHopToanCucDto>>(
      "/kPI_TieuChiChung_DiemSo/GetTongHopToanCuc",
      searchData
    );
    return response as any;
  }
}

const kPI_TieuChiChung_DiemSoService = KPI_TieuChiChung_DiemSoService.instance;
export default kPI_TieuChiChung_DiemSoService;
