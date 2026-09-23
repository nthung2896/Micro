import { ApiResponse } from "@/types/general";
import { EnterprisePlatformItemType } from "@/types/enterprisePlatformItem/dto";
import {
  EnterprisePlatformItemCreateRequestType,
  EnterprisePlatformItemUpdateRequestType,
} from "@/types/enterprisePlatformItem/request";
import { apiService } from "../index";

const BASE_URL = "/EnterprisePlatformItem";

const enterprisePlatformItemService = {
  getByPlatformManageId: (
    platformManageId: string,
  ): Promise<ApiResponse<EnterprisePlatformItemType[]>> =>
    apiService.get(`${BASE_URL}/GetByPlatformManageId/${platformManageId}`),

  create: (
    request: EnterprisePlatformItemCreateRequestType,
  ): Promise<ApiResponse<EnterprisePlatformItemType>> =>
    apiService.post(`${BASE_URL}/Create`, request),

  update: (
    request: EnterprisePlatformItemUpdateRequestType,
  ): Promise<ApiResponse<EnterprisePlatformItemType>> =>
    apiService.put(`${BASE_URL}/Update`, request),

  delete: (id: string): Promise<ApiResponse<null>> =>
    apiService.delete(`${BASE_URL}/Delete/${id}`),
};

export default enterprisePlatformItemService;
