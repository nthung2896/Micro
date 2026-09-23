import { ApiResponse, PagedList } from "@/types/general";
import {
  ThongKePhanAnhVaViPhamResultDto,
  ThongKePhanAnhVaViPhamDetailItem,
  ThongKeSoLuongTheoDiaPhuongDetailItem,
  ThongKeSoLuongTheoDiaPhuongDto,
  ThongKeSoLuongTheoDiaPhuongResultDto,
  ThongKeTheoThoiGianDto,
  ThongKeXuLyHoSoTheoDiaPhuongResultDto,
} from "@/types/quanLyThongKe/dto";
import {
  ThongKePhanAnhVaViPhamDetailSearchType,
  ThongKePhanAnhVaViPhamSearchType,
  ThongKeSoLuongTheoDiaPhuongDetailSearchType,
  ThongKeSoLuongTheoDiaPhuongSearchType,
  ThongKeTheoThoiGianSearchType,
  ThongKeXuLyHoSoTheoDiaPhuongSearchType,
} from "@/types/quanLyThongKe/request";
import { apiService } from "../index";

class QuanLyThongKeService {
  private static _instance: QuanLyThongKeService;

  public static get instance(): QuanLyThongKeService {
    if (!QuanLyThongKeService._instance) {
      QuanLyThongKeService._instance = new QuanLyThongKeService();
    }
    return QuanLyThongKeService._instance;
  }

  public async getThongKeSoLuongTheoDiaPhuong(
    search: ThongKeSoLuongTheoDiaPhuongSearchType,
  ): Promise<ApiResponse<ThongKeSoLuongTheoDiaPhuongResultDto>> {
    return apiService.post<ThongKeSoLuongTheoDiaPhuongResultDto>(
      `/PlatformManage/GetThongKeSoLuongTheoDiaPhuong`,
      search,
    );
  }

  public async getThongKeSoLuongTheoDiaPhuongDetail(
    search: ThongKeSoLuongTheoDiaPhuongDetailSearchType,
  ): Promise<ApiResponse<PagedList<ThongKeSoLuongTheoDiaPhuongDetailItem>>> {
    return apiService.post<PagedList<ThongKeSoLuongTheoDiaPhuongDetailItem>>(
      `/PlatformManage/GetThongKeSoLuongTheoDiaPhuongDetail`,
      search,
    );
  }

  public async exportThongKeSoLuongTheoDiaPhuong(
    search: ThongKeSoLuongTheoDiaPhuongSearchType,
  ): Promise<ApiResponse<string>> {
    return apiService.post<string>(
      `/PlatformManage/ExportThongKeSoLuongTheoDiaPhuong`,
      search,
    );
  }

  public async getThongKeTheoThoiGian(
    search: ThongKeTheoThoiGianSearchType,
  ): Promise<ApiResponse<ThongKeTheoThoiGianDto>> {
    return apiService.post<ThongKeTheoThoiGianDto>(
      `/PlatformManage/GetThongKeTheoThoiGian`,
      search,
    );
  }

  public async getThongKeXuLyHoSoTheoDiaPhuong(
    search: ThongKeXuLyHoSoTheoDiaPhuongSearchType,
  ): Promise<ApiResponse<ThongKeXuLyHoSoTheoDiaPhuongResultDto>> {
    return apiService.post<ThongKeXuLyHoSoTheoDiaPhuongResultDto>(
      `/PlatformManage/GetThongKeXuLyHoSoTheoDiaPhuong`,
      search,
    );
  }

  public async exportThongKeXuLyHoSoTheoDiaPhuong(
    search: ThongKeXuLyHoSoTheoDiaPhuongSearchType,
  ): Promise<ApiResponse<string>> {
    return apiService.post<string>(
      `/PlatformManage/ExportThongKeXuLyHoSoTheoDiaPhuong`,
      search,
    );
  }

  public async getThongKePhanAnhVaViPham(
    search: ThongKePhanAnhVaViPhamSearchType,
  ): Promise<ApiResponse<ThongKePhanAnhVaViPhamResultDto>> {
    return apiService.post<ThongKePhanAnhVaViPhamResultDto>(
      `/PhanAnhNenTang/GetThongKePhanAnhVaViPham`,
      search,
    );
  }

  public async getThongKePhanAnhVaViPhamDetail(
    search: ThongKePhanAnhVaViPhamDetailSearchType,
  ): Promise<ApiResponse<PagedList<ThongKePhanAnhVaViPhamDetailItem>>> {
    return apiService.post<PagedList<ThongKePhanAnhVaViPhamDetailItem>>(
      `/PhanAnhNenTang/GetThongKePhanAnhVaViPhamDetail`,
      search,
    );
  }

  public async exportThongKePhanAnhVaViPham(
    search: ThongKePhanAnhVaViPhamSearchType,
  ): Promise<ApiResponse<string>> {
    return apiService.post<string>(
      `/PhanAnhNenTang/ExportThongKePhanAnhVaViPham`,
      search,
    );
  }
}

const quanLyThongKeService = QuanLyThongKeService.instance;
export default quanLyThongKeService;
