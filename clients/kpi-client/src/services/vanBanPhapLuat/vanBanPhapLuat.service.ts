import { apiService } from "@/services/index";
import { PagedList } from "@/types/general";
import { VanBanPhapLuatDto, VanBanPhapLuatSearch, VanBanPhapLuatCreateRequest } from "@/types/vanBanPhapLuat";

class VanBanPhapLuatService {
  private static _instance: VanBanPhapLuatService;
  public static get instance(): VanBanPhapLuatService {
    if (!VanBanPhapLuatService._instance) VanBanPhapLuatService._instance = new VanBanPhapLuatService();
    return VanBanPhapLuatService._instance;
  }

  async getData(search: VanBanPhapLuatSearch) {
    return apiService.post<PagedList<VanBanPhapLuatDto>>("/VanBanPhapLuat/GetData", search);
  }
  async getPublicData(search: VanBanPhapLuatSearch) {
    return apiService.post<PagedList<VanBanPhapLuatDto>>("/VanBanPhapLuat/GetPublicData", search);
  }
  async getById(id: string) {
    return apiService.get<VanBanPhapLuatDto>(`/VanBanPhapLuat/Get/${id}`);
  }
  async createOrUpdate(data: VanBanPhapLuatCreateRequest) {
    return apiService.post<{ id: string }>("/VanBanPhapLuat/CreateOrUpdate", data);
  }
  async delete(id: string) {
    return apiService.delete<any>(`/VanBanPhapLuat/Delete/${id}`);
  }
}

const vanBanPhapLuatService = VanBanPhapLuatService.instance;
export default vanBanPhapLuatService;
