import { apiService } from "@/services/index";
import { PagedList } from "@/types/general";
import { MauBaoCaoDto, MauBaoCaoSearch, MauBaoCaoCreateRequest, MauBaoCaoChiTietDto, MauBaoCaoDataDto, MauBaoCaoTrackingSearch, MauBaoCaoTrackingDto, SaveMauBaoCaoDataRequest } from "@/types/mauBaoCao";

class MauBaoCaoService {
  private static _instance: MauBaoCaoService;
  public static get instance(): MauBaoCaoService {
    if (!MauBaoCaoService._instance) MauBaoCaoService._instance = new MauBaoCaoService();
    return MauBaoCaoService._instance;
  }

  async getData(search: MauBaoCaoSearch) {
    return apiService.post<PagedList<MauBaoCaoDto>>("/MauBaoCao/GetData", search);
  }
  async getById(id: string) {
    return apiService.get<MauBaoCaoDto>(`/MauBaoCao/Get/${id}`);
  }
  async getTemplateByPlatformType(appManageTypeId: number, loaiHinhNenTang: string) {
    return apiService.get<MauBaoCaoDto>("/MauBaoCao/GetTemplateByPlatformType", {
      params: { appManageTypeId, loaiHinhNenTang }
    });
  }
  async createOrUpdate(data: MauBaoCaoCreateRequest) {
    return apiService.post<{ id: string }>("/MauBaoCao/CreateOrUpdate", data);
  }
  async extractKeys(filePath: string) {
    return apiService.get<string>(`/MauBaoCao/ExtractKeys`, { params: { filePath } });
  }
  async getConfigByMauBaoCaoId(mauBaoCaoId: string) {
    return apiService.get<MauBaoCaoChiTietDto[]>(`/MauBaoCaoChiTiet/GetByMauBaoCaoId/${mauBaoCaoId}`);
  }
  async saveConfig(mauBaoCaoId: string, configs: MauBaoCaoChiTietDto[]) {
    return apiService.post<any>(`/MauBaoCaoChiTiet/SaveConfig/${mauBaoCaoId}`, configs);
  }
  async saveData(data: SaveMauBaoCaoDataRequest) {
    return apiService.post<any>("/MauBaoCao/SaveData", data);
  }
  async getSubmissionDetail(mauBaoCaoId: string | null, companyId?: string | null, platformId?: string | null, contractId?: string | null, thangBaoCao?: number, namBaoCao?: number, isSpecialistView?: boolean) {
    return apiService.get<MauBaoCaoDataDto>(`/MauBaoCao/GetSubmissionDetail`, {
      params: { mauBaoCaoId, companyId, platformId, contractId, thangBaoCao, namBaoCao, isSpecialistView }
    });
  }
  async getDanhSachKhaiBaoDoanhNghiep(search: any) {
    return apiService.post<any[]>("/MauBaoCao/GetDanhSachKhaiBaoDoanhNghiep", search);
  }

  async getSubmissionTracking(search: MauBaoCaoTrackingSearch) {
    return apiService.post<PagedList<MauBaoCaoTrackingDto>>("/MauBaoCao/GetSubmissionTracking", search);
  }
  async exportExcel(search: Partial<MauBaoCaoTrackingSearch>) {
    return apiService.post<string>("/MauBaoCao/ExportExcel", search);
  }
  async getDataValues(mauBaoCaoId: string, companyId?: string | null, platformId?: string | null, thangBaoCao?: number, namBaoCao?: number) {
    return apiService.get<Record<string, string>>(`/MauBaoCao/GetDataValues/${mauBaoCaoId}`, {
      params: { companyId, platformId, thangBaoCao, namBaoCao }
    });
  }
  async exportDocx(data: SaveMauBaoCaoDataRequest) {
    return apiService.post<string>("/MauBaoCao/ExportDocx", data);
  }
  async exportPdf(data: SaveMauBaoCaoDataRequest) {
    return apiService.post<string>("/MauBaoCao/ExportPdf", data);
  }
  async sendReminder(data: SaveMauBaoCaoDataRequest) {
    return apiService.post<any>("/MauBaoCao/SendReminder", data);
  }
  async sendCompanyReminder(data: { companyTaxCode: string; thangBaoCao: number; namBaoCao: number }) {
    return apiService.post<any>("/MauBaoCao/SendCompanyReminder", data);
  }
  async sendBulkCompanyReminder(data: { companyTaxCodes: string[]; thangBaoCao: number; namBaoCao: number }) {
    return apiService.post<any>("/MauBaoCao/SendBulkCompanyReminder", data);
  }
  async sendRemindAllCompanies(data: {
    thangBaoCao: number;
    namBaoCao: number;
    keyword?: string;
    loaiNenTang?: number | null;
    mauBaoCaoId?: string;
    trangThaiNenTang?: string;
  }) {
    return apiService.post<any>("/MauBaoCao/SendRemindAllCompanies", data);
  }
  async delete(id: string) {
    return apiService.delete<any>(`/MauBaoCao/Delete/${id}`);
  }
}

const mauBaoCaoService = MauBaoCaoService.instance;
export default mauBaoCaoService;
