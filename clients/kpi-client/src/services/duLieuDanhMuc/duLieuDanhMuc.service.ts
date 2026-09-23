import { apiService } from "../index";
import DM_DuLieuDanhMucServiceGenerated from "../generated/dM_DuLieuDanhMucService.generated";

class DuLieuDanhMucService extends DM_DuLieuDanhMucServiceGenerated {
  private static _instance: DuLieuDanhMucService;
  public static get instance(): DuLieuDanhMucService {
    if (!DuLieuDanhMucService._instance) {
      DuLieuDanhMucService._instance = new DuLieuDanhMucService();
    }
    return DuLieuDanhMucService._instance;
  }

  public async getDataPublish(search: any): Promise<any> {
    try {
      const response = await apiService.post<any>(
        `/publish/DM_DuLieuDanhMuc/GetData`,
        search,
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const duLieuDanhMucService = DuLieuDanhMucService.instance;
export default duLieuDanhMucService;
