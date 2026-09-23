import { apiService } from "@/services";
import {
  DataToSend,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  PhongTroCreateOrUpdateType,
  PhongTroSearchType,
  PhongTroType,
  ThongKeTinDangType,
} from "@/types/phongTro/phongTro";

class PhongTroService {
  private static _instance: PhongTroService;
  public static get instance(): PhongTroService {
    if (!PhongTroService._instance) {
      PhongTroService._instance = new PhongTroService();
    }
    return PhongTroService._instance;
  }

  public async getData(
    searchData: PhongTroSearchType
  ): Promise<Response<ResponsePageList<PhongTroType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<PhongTroType[]>>
    >("/phongTro/getData", searchData);
    return response as any;
  }

  public async create(
    formData: PhongTroCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/phongTro/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: PhongTroCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/phongTro/update",
      formData
    );
    return response as any;
  }

  public async getById(id: string): Promise<Response<PhongTroType>> {
    const response = await apiService.get<Response<PhongTroType>>(
      "/phongTro/get/" + id
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/phongTro/delete/" + id
    );
    return response as any;
  }

  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/phongTro/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: PhongTroSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/phongTro/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/phongTro/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/PhongTro/import");
    return response as any;
  }

  public async saveImport(form: DataToSend): Promise<Response> {
    const response = await apiService.post<Response>(
      "/phongTro/importExcel",
      form
    );
    return response as any;
  }

  public async dayTin(id: string): Promise<Response<PhongTroType>> {
    const response = await apiService.post<Response<PhongTroType>>(
      `/phongTro/dayTin/${id}`
    );
    return response as any;
  }

  public async giaHan(id: string, soNgay: number = 30): Promise<Response<PhongTroType>> {
    const response = await apiService.post<Response<PhongTroType>>(
      `/phongTro/giaHan/${id}?soNgay=${soNgay}`
    );
    return response as any;
  }

  public async nangCapVip(
    id: string,
    goiTin: number = 1,
    soNgay?: number
  ): Promise<Response<PhongTroType>> {
    const query = soNgay ? `?goiTin=${goiTin}&soNgay=${soNgay}` : `?goiTin=${goiTin}`;
    const response = await apiService.post<Response<PhongTroType>>(
      `/phongTro/nangCapVip/${id}${query}`
    );
    return response as any;
  }

  public async ganNhan(id: string): Promise<Response<PhongTroType>> {
    const response = await apiService.post<Response<PhongTroType>>(
      `/phongTro/ganNhan/${id}`
    );
    return response as any;
  }

  public async doiTrangThai(id: string): Promise<Response<PhongTroType>> {
    const response = await apiService.post<Response<PhongTroType>>(
      `/phongTro/doiTrangThai/${id}`
    );
    return response as any;
  }

  public async duyetTin(
    id: string,
    trangThai: number = 1,
    lyDo?: string
  ): Promise<Response<PhongTroType>> {
    const query = lyDo
      ? `?trangThai=${trangThai}&lyDo=${encodeURIComponent(lyDo)}`
      : `?trangThai=${trangThai}`;
    const response = await apiService.post<Response<PhongTroType>>(
      `/phongTro/duyetTin/${id}${query}`
    );
    return response as any;
  }

  public async getThongKe(chuTroId?: string): Promise<Response<ThongKeTinDangType>> {
    const query = chuTroId ? `?chuTroId=${chuTroId}` : "";
    const response = await apiService.get<Response<ThongKeTinDangType>>(
      `/phongTro/thongKe${query}`
    );
    return response as any;
  }
}

const phongTroService = PhongTroService.instance;
export default phongTroService;
