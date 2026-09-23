import { apiService } from "@/services";
import { Response } from "@/types/general";
import {
  KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse,
  KPI_TieuChiChung_DiemSo_CapTrenSaveBatchRequest,
} from "@/types/kPI_TieuChiChung_DiemSo_CapTren/kPI_TieuChiChung_DiemSo_CapTren";

class KPI_TieuChiChung_DiemSo_CapTrenService {
  private static _instance: KPI_TieuChiChung_DiemSo_CapTrenService;

  public static get instance(): KPI_TieuChiChung_DiemSo_CapTrenService {
    if (!KPI_TieuChiChung_DiemSo_CapTrenService._instance) {
      KPI_TieuChiChung_DiemSo_CapTrenService._instance = new KPI_TieuChiChung_DiemSo_CapTrenService();
    }
    return KPI_TieuChiChung_DiemSo_CapTrenService._instance;
  }

  public async getByPhieu(
    idPhieuDanhGia: string
  ): Promise<Response<KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse>> {
    const response = await apiService.get<Response<KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse>>(
      `/kPI_TieuChiChung_DiemSo_CapTren/GetByPhieu/${idPhieuDanhGia}`
    );
    return response as any;
  }

  // Chỉ dùng để tiền điền điểm cấp trên từ bản ghi của cấp liền trước.
  // Không tạo hoặc cập nhật dữ liệu trong lúc tải màn hình.
  public async getData(searchData: {
    pageIndex?: number;
    pageSize?: number;
    id_TieuChiChung_DiemSo?: string;
    vaiTroDanhGia?: string;
  }): Promise<Response<any>> {
    const response = await apiService.post<Response<any>>(
      "/kPI_TieuChiChung_DiemSo_CapTren/GetData",
      searchData
    );
    return response as any;
  }

  public async saveBatch(
    data: KPI_TieuChiChung_DiemSo_CapTrenSaveBatchRequest
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_TieuChiChung_DiemSo_CapTren/SaveBatch",
      data
    );
    return response as any;
  }
}

const kPI_TieuChiChung_DiemSo_CapTrenService = KPI_TieuChiChung_DiemSo_CapTrenService.instance;
export default kPI_TieuChiChung_DiemSo_CapTrenService;
