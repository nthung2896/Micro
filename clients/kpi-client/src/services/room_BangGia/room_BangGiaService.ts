import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  Room_BangGiaCreateOrUpdateType,
  Room_BangGiaSearchType,
  Room_BangGiaType,
} from "@/types/room_BangGia/room_BangGia";

class Room_BangGiaService {
  private static _instance: Room_BangGiaService;
  public static get instance(): Room_BangGiaService {
    if (!Room_BangGiaService._instance) {
      Room_BangGiaService._instance = new Room_BangGiaService();
    }
    return Room_BangGiaService._instance;
  }

  public async getData(
    searchData: Room_BangGiaSearchType
  ): Promise<Response<ResponsePageList<Room_BangGiaType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<Room_BangGiaType[]>>
    >("/room_BangGia/getData", searchData);
    return response as any;
  }

  public async create(
    formData: Room_BangGiaCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/room_BangGia/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: Room_BangGiaCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/room_BangGia/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/room_BangGia/delete/" + id
    );
    return response as any;
  }

  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/room_BangGia/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: Room_BangGiaSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/room_BangGia/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/room_BangGia/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/Room_BangGia/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/room_BangGia/importExcel",
      form
    );
    return response as any;
  }
}

const room_BangGiaService = Room_BangGiaService.instance;
export default room_BangGiaService;
