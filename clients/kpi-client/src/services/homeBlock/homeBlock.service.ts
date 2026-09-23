import { apiService } from "@/services/index";
import { PagedList } from "@/types/general";
import { HomeBlockDto, HomeBlockRequest, HomeBlockSearch } from "@/types/homeBlock";

class HomeBlockService {
  private static _instance: HomeBlockService;
  public static get instance(): HomeBlockService {
    if (!HomeBlockService._instance) HomeBlockService._instance = new HomeBlockService();
    return HomeBlockService._instance;
  }

  async getData(search: HomeBlockSearch) {
    return apiService.post<PagedList<HomeBlockDto>>("/HomeBlock/GetData", search);
  }
  async getById(id: string) {
    return apiService.get<HomeBlockDto>(`/HomeBlock/Get/${id}`);
  }
  async create(data: HomeBlockRequest) {
    return apiService.post<{ id: string }>("/HomeBlock/Create", data);
  }
  async update(data: HomeBlockRequest) {
    return apiService.put<{ id: string }>("/HomeBlock/Update", data);
  }
  async delete(id: string) {
    return apiService.delete<any>(`/HomeBlock/Delete/${id}`);
  }
  // Public endpoint cho trang Portal — lấy các block active theo position, sắp xếp theo sortOrder
  async getActiveByPosition(position: string) {
    return apiService.get<HomeBlockDto[]>(`/HomeBlock/GetActive/${position}`);
  }
  // Public endpoint — danh sách Sở Công Thương (Department.Code prefix SCT_)
  async getSctDepartments() {
    return apiService.get<SctDepartmentDto[]>("/HomeBlock/SctDepartments");
  }
}

export interface SctDepartmentDto {
  id: string;
  name: string;
  shortName?: string;
  code: string;
  address?: string;
  hotline?: string;
  email?: string;
}

const homeBlockService = HomeBlockService.instance;
export default homeBlockService;
