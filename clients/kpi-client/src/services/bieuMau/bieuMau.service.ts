import { apiService } from "@/services/index";
import { PagedList } from "@/types/general";
import { BieuMauDto, BieuMauSearch, BieuMauCreateRequest } from "@/types/bieuMau";

class BieuMauService {
  private static _instance: BieuMauService;
  public static get instance(): BieuMauService {
    if (!BieuMauService._instance) BieuMauService._instance = new BieuMauService();
    return BieuMauService._instance;
  }

  async getData(search: BieuMauSearch) {
    return apiService.post<PagedList<BieuMauDto>>("/BieuMau/GetData", search);
  }
  async getPublicData(search: BieuMauSearch) {
    return apiService.post<PagedList<BieuMauDto>>("/BieuMau/GetPublicData", search);
  }
  async getById(id: string) {
    return apiService.get<BieuMauDto>(`/BieuMau/Get/${id}`);
  }
  async createOrUpdate(data: BieuMauCreateRequest) {
    return apiService.post<{ id: string }>("/BieuMau/CreateOrUpdate", data);
  }
  async delete(id: string) {
    return apiService.delete<any>(`/BieuMau/Delete/${id}`);
  }
}

const bieuMauService = BieuMauService.instance;
export default bieuMauService;
