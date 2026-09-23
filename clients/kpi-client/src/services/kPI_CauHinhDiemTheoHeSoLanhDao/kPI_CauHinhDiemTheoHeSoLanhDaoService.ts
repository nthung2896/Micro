import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType,
  KPI_CauHinhDiemTheoHeSoLanhDaoSearchType,
  KPI_CauHinhDiemTheoHeSoLanhDaoType,
} from "@/types/kPI_CauHinhDiemTheoHeSoLanhDao/kPI_CauHinhDiemTheoHeSoLanhDao";

class KPI_CauHinhDiemTheoHeSoLanhDaoService {
  private static _instance: KPI_CauHinhDiemTheoHeSoLanhDaoService;
  public static get instance(): KPI_CauHinhDiemTheoHeSoLanhDaoService {
    if (!KPI_CauHinhDiemTheoHeSoLanhDaoService._instance) {
      KPI_CauHinhDiemTheoHeSoLanhDaoService._instance = new KPI_CauHinhDiemTheoHeSoLanhDaoService();
    }
    return KPI_CauHinhDiemTheoHeSoLanhDaoService._instance;
  }

  public async getData(
    searchData: KPI_CauHinhDiemTheoHeSoLanhDaoSearchType
  ): Promise<Response<ResponsePageList<KPI_CauHinhDiemTheoHeSoLanhDaoType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_CauHinhDiemTheoHeSoLanhDaoType[]>>
    >("/kPI_CauHinhDiemTheoHeSoLanhDao/getData", searchData);
    return response as any;
  }

  public async getByDotAndDonVi(
    idDotDanhGia: string | null,
    idDonVi?: string | null
  ): Promise<Response<KPI_CauHinhDiemTheoHeSoLanhDaoType[]>> {
    const params = new URLSearchParams();
    if (idDotDanhGia) params.append("idDotDanhGia", idDotDanhGia);
    if (idDonVi) params.append("idDonVi", idDonVi);

    const response = await apiService.get<Response<KPI_CauHinhDiemTheoHeSoLanhDaoType[]>>(
      `/kPI_CauHinhDiemTheoHeSoLanhDao/getByDotAndDonVi?${params.toString()}`
    );
    return response as any;
  }

  public async create(
    formData: KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_CauHinhDiemTheoHeSoLanhDao/create",
      formData
    );
    return response as any;
  }

  public async saveList(
    listData: KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType[],
    idBoTieuChi: string
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      `/kPI_CauHinhDiemTheoHeSoLanhDao/saveList?idBoTieuChi=${idBoTieuChi}`,
      listData
    );
    return response as any;
  }

  public async update(
    formData: KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_CauHinhDiemTheoHeSoLanhDao/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_CauHinhDiemTheoHeSoLanhDao/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_CauHinhDiemTheoHeSoLanhDao/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_CauHinhDiemTheoHeSoLanhDaoSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_CauHinhDiemTheoHeSoLanhDao/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_CauHinhDiemTheoHeSoLanhDao/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_CauHinhDiemTheoHeSoLanhDao/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_CauHinhDiemTheoHeSoLanhDao/importExcel",
      form
    );
    return response as any;
  }


}

const kPI_CauHinhDiemTheoHeSoLanhDaoService = KPI_CauHinhDiemTheoHeSoLanhDaoService.instance;
export default kPI_CauHinhDiemTheoHeSoLanhDaoService;
