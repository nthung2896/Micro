import { ApiResponse } from "@/types/general";
import { apiService } from "..";
import axios from "axios";

class CommonService {
  public async GetAllListFile(): Promise<ApiResponse> {
    try {
      const response = apiService.get<ApiResponse>("/Common/GetObjectsDynamic");
      return response;
    } catch (error) {
      throw error;
    }
  }
}
export const commonService = new CommonService();
