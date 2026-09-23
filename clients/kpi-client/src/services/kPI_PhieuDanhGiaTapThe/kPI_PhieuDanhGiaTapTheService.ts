import { apiService } from "@/services";
import {
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_PhieuDanhGiaTapTheCreateOrUpdateType,
  KPI_PhieuDanhGiaTapTheSearchType,
  KPI_PhieuDanhGiaTapTheType,
  DotDanhGiaWithPhieuTapTheType,
  KPI_PhieuDanhGiaTapTheTabCountDto,
  CheckQuyenChamDiemDto,
  KPI_TieuChiTapTheTreeDto,
  SaveScoresTapTheType,
} from "@/types/kPI_PhieuDanhGiaTapThe/kPI_PhieuDanhGiaTapThe";
import {
  ChuyenBuocLuongRequest,
  ThuHoiPhieuRequest,
  NguoiXuLyDto,
} from "@/types/kPI_PhieuDanhGia/kPI_PhieuDanhGia";

class KPI_PhieuDanhGiaTapTheService {
  private static _instance: KPI_PhieuDanhGiaTapTheService;
  public static get instance(): KPI_PhieuDanhGiaTapTheService {
    if (!KPI_PhieuDanhGiaTapTheService._instance) {
      KPI_PhieuDanhGiaTapTheService._instance = new KPI_PhieuDanhGiaTapTheService();
    }
    return KPI_PhieuDanhGiaTapTheService._instance;
  }

  public async getData(
    searchData: KPI_PhieuDanhGiaTapTheSearchType
  ): Promise<Response<ResponsePageList<KPI_PhieuDanhGiaTapTheType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_PhieuDanhGiaTapTheType[]>>
    >("/KPI_PhieuDanhGiaTapThe/GetData", searchData);
    return response as any;
  }

  public async getById(id: string): Promise<Response<KPI_PhieuDanhGiaTapTheType>> {
    const response = await apiService.get<Response<KPI_PhieuDanhGiaTapTheType>>(
      `/KPI_PhieuDanhGiaTapThe/Get/${id}`
    );
    return response as any;
  }

  public async initPhieuDanhGiaTapThe(
    idDotDanhGia: string,
    donViId: string,
    phongBanId?: string
  ): Promise<Response<string>> {
    let url = `/KPI_PhieuDanhGiaTapThe/InitPhieuDanhGiaTapThe?idDotDanhGia=${idDotDanhGia}&donViId=${donViId}`;
    if (phongBanId) {
      url += `&phongBanId=${phongBanId}`;
    }
    const response = await apiService.post<Response<string>>(url);
    return response as any;
  }

  public async getDotDanhGiaWithPhieu(
    userId: string,
    searchData: KPI_PhieuDanhGiaTapTheSearchType
  ): Promise<Response<ResponsePageList<DotDanhGiaWithPhieuTapTheType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<DotDanhGiaWithPhieuTapTheType[]>>
    >(`/KPI_PhieuDanhGiaTapThe/GetDotDanhGiaWithPhieu/${userId}`, searchData);
    return response as any;
  }

  public async getDanhSachDonViDanhGia(
    userId: string,
    searchData: KPI_PhieuDanhGiaTapTheSearchType
  ): Promise<Response<ResponsePageList<DotDanhGiaWithPhieuTapTheType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<DotDanhGiaWithPhieuTapTheType[]>>
    >(`/KPI_PhieuDanhGiaTapThe/GetDanhSachDonViDanhGia/${userId}`, searchData);
    return response as any;
  }

  public async getTabCounts(
    userId: string,
    searchData: KPI_PhieuDanhGiaTapTheSearchType
  ): Promise<Response<KPI_PhieuDanhGiaTapTheTabCountDto>> {
    const response = await apiService.post<
      Response<KPI_PhieuDanhGiaTapTheTabCountDto>
    >(`/KPI_PhieuDanhGiaTapThe/GetTabCounts/${userId}`, searchData);
    return response as any;
  }

  public async create(
    formData: KPI_PhieuDanhGiaTapTheCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/KPI_PhieuDanhGiaTapThe/Create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_PhieuDanhGiaTapTheCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/KPI_PhieuDanhGiaTapThe/Update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      `/KPI_PhieuDanhGiaTapThe/Delete/${id}`
    );
    return response as any;
  }

  public async chuyenBuocLuong(
    request: ChuyenBuocLuongRequest
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/KPI_PhieuDanhGiaTapThe/ChuyenBuocLuong",
      request
    );
    return response as any;
  }

  public async thuHoiPhieu(
    request: ThuHoiPhieuRequest
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/KPI_PhieuDanhGiaTapThe/ThuHoiPhieu",
      request
    );
    return response as any;
  }

  public async getNguoiXuLy(
    idPhieuDanhGia: string,
    chucVuNguoiXuLy: string
  ): Promise<Response<NguoiXuLyDto[]>> {
    const response = await apiService.get<Response<NguoiXuLyDto[]>>(
      `/KPI_PhieuDanhGiaTapThe/GetNguoiXuLy/${idPhieuDanhGia}/${chucVuNguoiXuLy}`
    );
    return response as any;
  }

  public async checkQuyenChamDiem(
    idPhieuDanhGia?: string,
    donViId?: string,
    idDotDanhGia?: string
  ): Promise<Response<CheckQuyenChamDiemDto>> {
    let url = "/KPI_PhieuDanhGiaTapThe/CheckQuyenChamDiem?";
    const params = new URLSearchParams();
    if (idPhieuDanhGia) params.append("idPhieuDanhGia", idPhieuDanhGia);
    if (donViId) params.append("donViId", donViId);
    if (idDotDanhGia) params.append("idDotDanhGia", idDotDanhGia);

    const response = await apiService.get<Response<CheckQuyenChamDiemDto>>(
      url + params.toString()
    );
    return response as any;
  }

  public async getTreeDataForTapThe(
    idDot: string,
    idPhieu?: string | null,
    idDonVi?: string | null
  ): Promise<Response<KPI_TieuChiTapTheTreeDto[]>> {
    let url = `/KPI_PhieuDanhGiaTapThe/GetTreeDataForTapThe?idDot=${idDot}`;
    if (idPhieu) url += `&idPhieu=${idPhieu}`;
    if (idDonVi) url += `&idDonVi=${idDonVi}`;

    const response = await apiService.get<Response<KPI_TieuChiTapTheTreeDto[]>>(url);
    return response as any;
  }

  public async saveScoresTapThe(
    model: SaveScoresTapTheType
  ): Promise<Response<any>> {
    const response = await apiService.post<Response<any>>(
      "/KPI_PhieuDanhGiaTapThe/SaveScoresTapThe",
      model
    );
    return response as any;
  }
}

export default KPI_PhieuDanhGiaTapTheService.instance;

