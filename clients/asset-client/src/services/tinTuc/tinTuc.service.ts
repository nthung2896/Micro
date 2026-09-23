import { apiService } from "@/services/index";
import { PagedList } from "@/types/general";
import { TinTucDto, TinTucSearch, TinTucCreateRequest } from "@/types/tinTuc";

class TinTucService {
  private static _instance: TinTucService;

  public static get instance(): TinTucService {
    if (!TinTucService._instance) {
      TinTucService._instance = new TinTucService();
    }
    return TinTucService._instance;
  }

  async getData(search: TinTucSearch) {
    return apiService.post<PagedList<TinTucDto>>("/TinTuc/GetData", search);
  }

  async getPublicData(search: TinTucSearch) {
    return apiService.post<PagedList<TinTucDto>>(
      "/TinTuc/GetPublicData",
      search,
    );
  }

  async getById(id: string) {
    return apiService.get<TinTucDto>(`/TinTuc/Get/${id}`);
  }

  async getBySlug(slug: string) {
    return apiService.get<TinTucDto>(`/TinTuc/GetBySlug/${encodeURIComponent(slug)}`);
  }

  async createOrUpdate(data: TinTucCreateRequest) {
    return apiService.post<{ id: string }>("/TinTuc/CreateOrUpdate", data);
  }

  async updateTrangThai(id: string, trangThai: number) {
    return apiService.put<any>(`/TinTuc/UpdateTrangThai/${id}/${trangThai}`);
  }

  async delete(id: string) {
    return apiService.delete<any>(`/TinTuc/Delete/${id}`);
  }

  async incrementView(id: string) {
    return apiService.put<any>(`/TinTuc/IncrementView/${id}`);
  }
}

const tinTucService = TinTucService.instance;
export default tinTucService;
