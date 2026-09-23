import { VuViecTraoDoiType } from "@/types/vu-viec-trao-doi/dto";
import { ApiResponse } from "@/types/general";
import { apiService } from "../index";

class VuViecTraoDoiService {
  private static _instance: VuViecTraoDoiService;

  public static get instance(): VuViecTraoDoiService {
    if (!VuViecTraoDoiService._instance) {
      VuViecTraoDoiService._instance = new VuViecTraoDoiService();
    }
    return VuViecTraoDoiService._instance;
  }

  public async getListByVuViec(
    vuViecId: string
  ): Promise<ApiResponse<VuViecTraoDoiType[]>> {
    try {
      const response = await apiService.get<VuViecTraoDoiType[]>(
        `/VuViecTraoDoi/GetListByVuViec/${vuViecId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async create(
    model: VuViecTraoDoiType
  ): Promise<ApiResponse<VuViecTraoDoiType>> {
    try {
      const response = await apiService.post<VuViecTraoDoiType>(
        `/VuViecTraoDoi/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const vuViecTraoDoiService = VuViecTraoDoiService.instance;
export default vuViecTraoDoiService;
