import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_NhiemVuCreateOrUpdateType,
  KPI_NhiemVuSearchType,
  KPI_NhiemVuType,
} from "@/types/kPI_NhiemVu/kPI_NhiemVu";

class KPI_NhiemVuService {
  private static _instance: KPI_NhiemVuService;
  public static get instance(): KPI_NhiemVuService {
    if (!KPI_NhiemVuService._instance) {
      KPI_NhiemVuService._instance = new KPI_NhiemVuService();
    }
    return KPI_NhiemVuService._instance;
  }

  public async getData(
    searchData: KPI_NhiemVuSearchType
  ): Promise<Response<ResponsePageList<KPI_NhiemVuType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_NhiemVuType[]>>
    >("/kPI_NhiemVu/getData", searchData);
    return response as any;
  }

  public async create(
    formData: KPI_NhiemVuCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_NhiemVu/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_NhiemVuCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_NhiemVu/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_NhiemVu/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_NhiemVu/getDropDowns"
    );
    return response as any;
  }

  public async getNhiemVuByTypeAndLyLich(idLyLich: string, type: string, idDotTheoDoiDanhGia: string): Promise<Response<KPI_NhiemVuType[]>> {
    const response = await apiService.get<KPI_NhiemVuType[]>(
      `/kPI_NhiemVu/GetNhiemVuByTypeAndLyLich?idLyLich=${idLyLich}&type=${type}&idDotTheoDoiDanhGia=${idDotTheoDoiDanhGia}`
    );
    return response as any;
  }

  public async getChiTietNhiemVuThang(idLyLich: string, idDotDanhGia: string): Promise<Response<any>> {
    const response = await apiService.get<any>(
      `/KPI_NhiemVu/GetChiTietNhiemVuThang?idLyLich=${idLyLich}&idDotDanhGia=${idDotDanhGia}`
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_NhiemVuSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_NhiemVu/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_NhiemVu/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_NhiemVu/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_NhiemVu/importExcel",
      form
    );
    return response as any;
  }


  public async createPhatSinhBulk(data: any[]): Promise<Response> {
    const response = await apiService.post<Response>(
      "/KPI_NhiemVu/CreatePhatSinhBulk",
      data
    );
    return response as any;
  }

  public async saveWithAttachments(formData: FormData): Promise<Response<any>> {
    const response = await apiService.post<Response<any>>(
      "/KPI_NhiemVu/SaveWithAttachments",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response as any;
  }

  public async saveKetQua(data: any): Promise<Response> {
    const response = await apiService.post<Response>(
      "/KPI_NhiemVu/SaveKetQuaThucHien",
      data
    );
    return response as any;
  }

  public async getKetQuaThucHien(idPhieuDanhGia?: string | null, idDotDanhGia?: string | null, idLyLich?: string | null): Promise<Response<any>> {
    let url = "/KPI_NhiemVu/GetKetQuaThucHien";
    const params = new URLSearchParams();
    if (idPhieuDanhGia) params.append("idPhieuDanhGia", idPhieuDanhGia);
    if (idDotDanhGia) params.append("idDotDanhGia", idDotDanhGia);
    if (idLyLich) params.append("idLyLich", idLyLich);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await apiService.get<Response<any>>(url);
    return response as any;
  }

  public async getHeSoLanhDaoApDung(
    idPhieuDanhGia?: string | null,
    idDotDanhGia?: string | null,
    idLyLich?: string | null
  ): Promise<Response<any>> {
    const params = new URLSearchParams();
    if (idPhieuDanhGia) params.append("idPhieuDanhGia", idPhieuDanhGia);
    if (idDotDanhGia) params.append("idDotDanhGia", idDotDanhGia);
    if (idLyLich) params.append("idLyLich", idLyLich);
    const response = await apiService.get<Response<any>>(
      `/KPI_NhiemVu/GetHeSoLanhDaoApDung?${params.toString()}`
    );
    return response as any;
  }
    public async saveNhiemVuTCCB(data: any): Promise<Response<string>> {
      const response = await apiService.post<Response<string>>(
        "/KPI_NhiemVu/SaveNhiemVuTCCB",
        data
      );
      return response as any;
    }

    public async deleteNhiemVuTCCB(id: string): Promise<Response> {
      const response = await apiService.delete<Response>(
        `/KPI_NhiemVu/DeleteNhiemVuTCCB/${id}`
      );
      return response as any;
    }
}

const kPI_NhiemVuService = KPI_NhiemVuService.instance;
export default kPI_NhiemVuService;
