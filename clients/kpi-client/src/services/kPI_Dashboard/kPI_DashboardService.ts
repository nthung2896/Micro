import { apiService } from "@/services";
import { Response } from "@/types/general";
import {
  NhanSuSoSanhType,
  PhamViSoSanhNhanSuType,
  PhongBanSoSanhType,
  SoSanhDiemNhanSuRequestType,
  SoSanhDiemNhanSuType,
  ThongKeDiemNhanSuType,
} from "@/types/kPI_Dashboard/dto";

class KPI_DashboardService {
  private static _instance: KPI_DashboardService;
  public static get instance(): KPI_DashboardService {
    if (!KPI_DashboardService._instance) {
      KPI_DashboardService._instance = new KPI_DashboardService();
    }
    return KPI_DashboardService._instance;
  }

  public async getDataKhoiThongKeCaNhan(
    idLyLich: string
  ): Promise<Response<any>> {
    const response = await apiService.get<Response<any>>(
      `/KPI_Dashboard/GetDataKhoiThongKeCaNhan?IdLyLich=${idLyLich}`
    );
    return response as any;
  }

  public async getThongKeDiemNhanSu(
    chucVuCode: string,
    idDotDanhGia: string,
    vaiTroDanhGia?: string,
  ): Promise<Response<ThongKeDiemNhanSuType[]>> {
    const params = new URLSearchParams({ chucVuCode, idDotDanhGia });
    if (vaiTroDanhGia) {
      params.append("vaiTroDanhGia", vaiTroDanhGia);
    }
    const response = await apiService.get<ThongKeDiemNhanSuType[]>(
      `/KPI_Dashboard/GetThongKeDiemNhanSu?${params.toString()}`,
    );
    return response as any;
  }

  public async getThongKeNhanSuPhongBan(): Promise<Response<any>> {
    const response = await apiService.get<any>(
      "/KPI_Dashboard/GetThongKeNhanSuPhongBan"
    );
    return response as any;
  }

  public async getPhongBanSoSanh(): Promise<Response<PhongBanSoSanhType[]>> {
    const response = await apiService.get<PhongBanSoSanhType[]>(
      "/KPI_Dashboard/GetPhongBanSoSanh",
    );
    return response as any;
  }

  public async getPhamViSoSanhNhanSu(): Promise<Response<PhamViSoSanhNhanSuType>> {
    const response = await apiService.get<PhamViSoSanhNhanSuType>(
      "/KPI_Dashboard/GetPhamViSoSanhNhanSu",
    );
    return response as any;
  }

  public async getNhanSuSoSanh(
    phongBanId?: string,
  ): Promise<Response<NhanSuSoSanhType[]>> {
    const query = phongBanId
      ? `?phongBanId=${encodeURIComponent(phongBanId)}`
      : "";
    const response = await apiService.get<NhanSuSoSanhType[]>(
      `/KPI_Dashboard/GetNhanSuSoSanh${query}`,
    );
    return response as any;
  }

  public async getSoSanhDiemNhanSu(
    request: SoSanhDiemNhanSuRequestType,
  ): Promise<Response<SoSanhDiemNhanSuType>> {
    const response = await apiService.post<SoSanhDiemNhanSuType>(
      "/KPI_Dashboard/GetSoSanhDiemNhanSu",
      request,
    );
    return response as any;
  }

  public async getTopSoSanhDiemNhanSu(
    idDotDanhGia: string,
  ): Promise<Response<SoSanhDiemNhanSuType>> {
    const response = await apiService.get<SoSanhDiemNhanSuType>(
      `/KPI_Dashboard/GetTopSoSanhDiemNhanSu?idDotDanhGia=${encodeURIComponent(idDotDanhGia)}`,
    );
    return response as any;
  }
}

const kPI_DashboardService = KPI_DashboardService.instance;
export default kPI_DashboardService;
