import { apiService } from "@/services/index";
import { ApiResponse, PagedList } from "@/types/general";
import { NavMenuDto, NavMenuRequest, NavMenuSearch } from "@/types/navMenu";

class NavMenuService {
  private static _instance: NavMenuService;
  public static get instance(): NavMenuService {
    if (!NavMenuService._instance) NavMenuService._instance = new NavMenuService();
    return NavMenuService._instance;
  }

  public async getData(
    search: NavMenuSearch
  ): Promise<ApiResponse<PagedList<NavMenuDto>>> {
    try {
      const response = await apiService.post<PagedList<NavMenuDto>>(
        "/NavMenu/GetData",
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getById(
    id: string
  ): Promise<ApiResponse<NavMenuDto>> {
    try {
      const response = await apiService.get<NavMenuDto>(
        `/NavMenu/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async create(
    data: NavMenuRequest
  ): Promise<ApiResponse<NavMenuDto>> {
    try {
      const response = await apiService.post<NavMenuDto>(
        "/NavMenu/Create",
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    data: NavMenuRequest
  ): Promise<ApiResponse<NavMenuDto>> {
    try {
      const response = await apiService.put<NavMenuDto>(
        "/NavMenu/Update",
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async delete(
    id: string
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.delete<any>(
        `/NavMenu/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getActiveTree(menuType?: string): Promise<ApiResponse<NavMenuDto[]>> {
    try {
      const response = await apiService.get<NavMenuDto[]>(
        "/NavMenu/GetActiveTree",
        { params: { menuType } }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const navMenuService = NavMenuService.instance;
export default navMenuService;
