import { apiService } from "@/services/index";
import { PagedList } from "@/types/general";
import { BannerDto, BannerSearch, BannerRequest } from "@/types/banner";

class BannerService {
  private static _instance: BannerService;
  public static get instance(): BannerService {
    if (!BannerService._instance) BannerService._instance = new BannerService();
    return BannerService._instance;
  }

  async getData(search: BannerSearch) {
    return apiService.post<PagedList<BannerDto>>("/Banner/GetData", search);
  }
  async getPublicData(position?: string) {
    return apiService.get<BannerDto[]>("/Banner/GetPublicData", { params: { position } });
  }
  async getById(id: string) {
    return apiService.get<BannerDto>(`/Banner/Get/${id}`);
  }
  async createOrUpdate(data: BannerRequest) {
    return apiService.post<{ id: string }>("/Banner/CreateOrUpdate", data);
  }
  async updateTrangThai(id: string, isActive: boolean) {
    return apiService.put<any>(`/Banner/UpdateTrangThai/${id}/${isActive}`);
  }
  async delete(id: string) {
    return apiService.delete<any>(`/Banner/Delete/${id}`);
  }
}

const bannerService = BannerService.instance;
export default bannerService;
