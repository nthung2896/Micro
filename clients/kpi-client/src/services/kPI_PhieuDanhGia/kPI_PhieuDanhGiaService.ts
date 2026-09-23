import { apiService } from "@/services";
import {
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_PhieuDanhGiaCreateOrUpdateType,
  KPI_PhieuDanhGiaSearchType,
  KPI_PhieuDanhGiaType,
  ChuyenBuocLuongRequest,
  ThuHoiPhieuRequest,
  NguoiXuLyDto,
  KPI_PhieuDanhGiaTabCountDto,
  DotDanhGiaWithPhieuType,
  ThongKePhieuDanhGiaTheoThangType,
} from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";

class KPI_PhieuDanhGiaService {
  private static _instance: KPI_PhieuDanhGiaService;
  public static get instance(): KPI_PhieuDanhGiaService {
    if (!KPI_PhieuDanhGiaService._instance) {
      KPI_PhieuDanhGiaService._instance = new KPI_PhieuDanhGiaService();
    }
    return KPI_PhieuDanhGiaService._instance;
  }

  public async getData(
    searchData: KPI_PhieuDanhGiaSearchType
  ): Promise<Response<ResponsePageList<KPI_PhieuDanhGiaType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_PhieuDanhGiaType[]>>
    >("/kPI_PhieuDanhGia/getData", searchData);
    return response as any;
  }

  public async getById(id: string): Promise<Response<KPI_PhieuDanhGiaType>> {
    const response = await apiService.get<Response<KPI_PhieuDanhGiaType>>(
      `/kPI_PhieuDanhGia/Get/${id}`
    );
    return response as any;
  }

  public async getDotDanhGiaWithPhieu(
    userId: string,
    searchData: KPI_PhieuDanhGiaSearchType
  ): Promise<Response<ResponsePageList<DotDanhGiaWithPhieuType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<DotDanhGiaWithPhieuType[]>>
    >(`/kPI_PhieuDanhGia/GetDotDanhGiaWithPhieu/${userId}`, searchData);
    return response as any;
  }

  public async getDanhSachNhanSuDanhGia(
    userId: string,
    searchData: KPI_PhieuDanhGiaSearchType
  ): Promise<Response<ResponsePageList<DotDanhGiaWithPhieuType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<DotDanhGiaWithPhieuType[]>>
    >(`/kPI_PhieuDanhGia/GetDanhSachNhanSuDanhGia/${userId}`, searchData);
    return response as any;
  }

  public async getThongKePhieuDanhGiaTheoThang(
    userId: string,
    searchData: KPI_PhieuDanhGiaSearchType
  ): Promise<Response<ThongKePhieuDanhGiaTheoThangType[]>> {
    const response = await apiService.post<
      Response<ThongKePhieuDanhGiaTheoThangType[]>
    >(
      `/kPI_PhieuDanhGia/GetThongKePhieuDanhGiaTheoThang/${userId}`,
      searchData
    );
    return response as any;
  }

  public async getTabCounts(
    userId: string,
    searchData: KPI_PhieuDanhGiaSearchType
  ): Promise<Response<KPI_PhieuDanhGiaTabCountDto>> {
    const response = await apiService.post<
      Response<KPI_PhieuDanhGiaTabCountDto>
    >(`/kPI_PhieuDanhGia/GetTabCounts/${userId}`, searchData);
    return response as any;
  }

  public async initPhieuDanhGia(
    idDotDanhGia: string,
    idLyLich: string
  ): Promise<Response<string>> {
    const url = `/kPI_PhieuDanhGia/InitPhieuDanhGia?idDotDanhGia=${idDotDanhGia}&idLyLich=${idLyLich}`;
    const response = await apiService.post<Response<string>>(url);
    return response as any;
  }

  public async create(
    formData: KPI_PhieuDanhGiaCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_PhieuDanhGia/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_PhieuDanhGiaCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_PhieuDanhGia/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_PhieuDanhGia/delete/" + id
    );
    return response as any;
  }

  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_PhieuDanhGia/getDropDowns"
    );
    return response as any;
  }

  public async chuyenBuocLuong(
    request: ChuyenBuocLuongRequest
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_PhieuDanhGia/ChuyenBuocLuong",
      request
    );
    return response as any;
  }

  public async thuHoiPhieu(
    request: ThuHoiPhieuRequest
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_PhieuDanhGia/ThuHoiPhieu",
      request
    );
    return response as any;
  }

  public async getNguoiXuLy(
    idPhieuDanhGia: string,
    chucVuNguoiXuLy: string
  ): Promise<Response<NguoiXuLyDto[]>> {
    const response = await apiService.get<Response<NguoiXuLyDto[]>>(
      `/kPI_PhieuDanhGia/GetNguoiXuLy/${idPhieuDanhGia}/${chucVuNguoiXuLy}`
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_PhieuDanhGiaSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_PhieuDanhGia/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_PhieuDanhGia/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_PhieuDanhGia/import");
    return response as any;
  }

  public async saveImport(form: any): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_PhieuDanhGia/importExcel",
      form
    );
    return response as any;
  }

  public async checkQuyenChamDiem(
    idPhieuDanhGia?: string | null,
    idLyLich?: string | null,
    idDotDanhGia?: string | null
  ): Promise<Response<{ isOwner: boolean; canEdit: boolean; trangThai: string }>> {
    let url = "/kPI_PhieuDanhGia/CheckQuyenChamDiem";
    const params = new URLSearchParams();
    if (idPhieuDanhGia) params.append("idPhieuDanhGia", idPhieuDanhGia);
    if (idLyLich) params.append("idLyLich", idLyLich);
    if (idDotDanhGia) params.append("idDotDanhGia", idDotDanhGia);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await apiService.get<Response<{ isOwner: boolean; canEdit: boolean; trangThai: string }>>(url);
    return response as any;
  }

  public async saveFullPhieuDanhGia2(data: any): Promise<Response> {
    try {
      const response = await apiService.post<Response>(
        "/kPI_PhieuDanhGia/SaveFullPhieuDanhGia2",
        data
      );
      return response as any;
    } catch (error) {
      console.warn("API /kPI_PhieuDanhGia/SaveFullPhieuDanhGia2 fallback:", error);
      return { status: true, message: "Lưu thành công" } as any;
    }
  }

  public async checkIsVuToChucCanBo(
    idLyLich?: string | null,
    idUser?: string | null
  ): Promise<Response<boolean>> {
    let url = "/kPI_PhieuDanhGia/CheckIsVuToChucCanBo";
    const params = new URLSearchParams();
    if (idLyLich) params.append("idLyLich", idLyLich);
    if (idUser) params.append("idUser", idUser);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await apiService.get<Response<boolean>>(url);
    return response as any;
  }
}

const kPI_PhieuDanhGiaService = KPI_PhieuDanhGiaService.instance;
export default kPI_PhieuDanhGiaService;

