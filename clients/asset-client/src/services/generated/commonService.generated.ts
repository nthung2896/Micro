import {
  TaiLieuDinhKemType,
} from "@/types/taiLieuDinhKem/dto";
import {
  UploadFileType,
} from "@/types/common/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class CommonServiceGenerated {
  public async uploadFilePublish(
    form: FormData
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response = await apiService.post<TaiLieuDinhKemType[]>(
        `/Common/uploadPublish`,
        form
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getLstUploadsFile(
    itemid: string
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response = await apiService.post<TaiLieuDinhKemType[]>(
        `/Common/deleteTempFile?Itemid=${itemid}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default CommonServiceGenerated;
