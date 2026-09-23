import { PagedList, ApiResponse } from "@/types/general";
import { DangKyXemLogType } from "@/types/dang-ky-xem-log/dto";
import { DangKyXemLogSearchType } from "@/types/dang-ky-xem-log/request";
import { apiService } from "../index";

const URL = "DangKyXemLog";

export const dangKyXemLogService = {
  getData: async (
    search: DangKyXemLogSearchType,
  ): Promise<PagedList<DangKyXemLogType>> => {
    const response = await apiService.post<PagedList<DangKyXemLogType>>(
      `${URL}/GetData`,
      search,
    );
    return response.data as PagedList<DangKyXemLogType>;
  },
};
