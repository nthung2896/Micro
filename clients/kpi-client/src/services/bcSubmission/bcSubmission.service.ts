import { apiService } from "@/services/index";

class BcSubmissionService {
  private static _instance: BcSubmissionService;
  public static get instance(): BcSubmissionService {
    if (!BcSubmissionService._instance)
      BcSubmissionService._instance = new BcSubmissionService();
    return BcSubmissionService._instance;
  }

  async getTemplate(idDoiTuongBaoCao: string) {
    return apiService.get<any>(`/BCSubmission/GetTemplate/${idDoiTuongBaoCao}`);
  }

  async submit(data: {
    baoCaoDoiTuongId: string;
    formTemplateId?: string | null;
    submittedValues: any;
    status?: string;
    thangBaoCao?: number;
    namBaoCao?: number;
  }) {
    return apiService.post<any>("/BCSubmission/Submit", data);
  }

  async saveDraft(data: { baoCaoDoiTuongId: string; submittedValues: any }) {
    return apiService.post<any>("/BCSubmission/SaveDraft", data);
  }

  async getSubmission(
    baoCaoDoiTuongId: string,
    formTemplateId: string,
    month?: number | string,
    year?: number | string,
  ) {
    let url = `/BCSubmission/${baoCaoDoiTuongId}/FormTemplate/${formTemplateId}`;
    if (month && year) {
      url += `?month=${month}&year=${year}`;
    }
    return apiService.get<any>(url);
  }
  async GetFormTemplate(id: string) {
    return apiService.get<any>(`/BCFormTemplate/GetFormTemplate/${id}`);
  }

  async parseWord(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return apiService.post<any>("/BCBaoCao/ParseWordTemplate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async saveTemplate(template: any, idBaoCao?: string) {
    return apiService.post<any>(
      `/BCBaoCao/SaveFormTemplate${idBaoCao ? `?idBaoCao=${idBaoCao}` : ""}`,
      template,
    );
  }

  async getFormTemplate(idBaoCao: string) {
    return apiService.get<any>(`/BCBaoCao/GetFormTemplate/${idBaoCao}`);
  }

  async getBCCategories() {
    return apiService.get<any>("/BCFormTemplate/GetBCCategories");
  }

  async getMyReports(taxcode?: string) {
    return apiService.get<any>(
      `/BCBaoCaoDoiTuong/GetMyReports${taxcode ? `?taxcode=${taxcode}` : ""}`,
    );
  }

  async getDetail(id: string) {
    return apiService.get<any>(`/BCBaoCaoDoiTuong/GetDetail/${id}`);
  }

  async getSubmissionPackage(id: string) {
    return apiService.get<any>(`/BCSubmission/GetSubmissionPackage/${id}`);
  }

  async getSummaryByProvince(thang: number, nam: number) {
    return apiService.get<any>(
      `/BCSubmission/GetSummaryByProvince?thang=${thang}&nam=${nam}`,
    );
  }

  async getSummaryByNganhHang(thang: number, nam: number) {
    return apiService.get<any>(
      `/BCSubmission/GetSummaryByNganhHang?thang=${thang}&nam=${nam}`,
    );
  }

  async createPeriod(data: any) {
    return apiService.post<any>("/BCDotBaoCao/Create", data);
  }

  async createHangNam(data: any) {
    return apiService.post<any>("/BCDotBaoCao/Create-HangNam", data);
  }

  async createNenTangLon(data: any) {
    return apiService.post<any>("/BCDotBaoCao/Create-NenTangLon", data);
  }

  async getBaoCaoDoiTuongData(searchParams: any) {
    return apiService.post<any>("/BCBaoCaoDoiTuong/GetData", searchParams);
  }

  async getDotBaoCaoData(searchParams: any) {
    return apiService.post<any>("/BCDotBaoCao/GetData", searchParams);
  }

  async getBaoCaoDuocPhepDuyet(searchParams: any) {
    return apiService.post<any>(
      "/BCDotBaoCao/GetBaoCaoDuocDuyet",
      searchParams,
    );
  }

  async getDotBaoCaoDetail(id: string) {
    return apiService.get<any>(`/BCDotBaoCao/Get/${id}`);
  }

  async getBaoCaoList() {
    return apiService.post<any>("/BCBaoCao/GetData", {
      pageIndex: 1,
      pageSize: 1000,
    });
  }

  async createBaoCao(data: { name: string; description: string }) {
    return apiService.post<any>("/BCBaoCao/Create", data);
  }

  async updateBaoCao(data: { id: string; name: string; description: string }) {
    return apiService.put<any>("/BCBaoCao/Update", data);
  }

  async deleteBaoCao(id: string) {
    return apiService.delete<any>(`/BCBaoCao/Delete/${id}`);
  }

  async getAllTemplates() {
    return apiService.get<any>("/BCBaoCao/GetAllFormTemplates");
  }

  async getPeriods() {
    return apiService.get<any>("/BCDotBaoCao/GetList");
  }

  async assignSubjects(id: string) {
    return apiService.post<any>(`/BCDotBaoCao/AssignSubjects/${id}`, {});
  }

  async updatePeriod(data: any) {
    return apiService.put<any>("/BCDotBaoCao/Update", data);
  }

  async deletePeriod(id: string) {
    return apiService.delete<any>(`/BCDotBaoCao/Delete/${id}`);
  }

  async getSummaryByProvinceNam(nam: number) {
    return apiService.get<any>(
      `/BCSubmission/GetSummaryByProvinceNam?nam=${nam}`,
    );
  }

  async getSummaryByNganhHangNam(nam: number) {
    return apiService.get<any>(
      `/BCSubmission/GetSummaryByNganhHangNam?nam=${nam}`,
    );
  }

  async getListHistory(baoCaoDoiTuongId: string) {
    return apiService.get<any>(
      `/BCSubmission/GetListHistory/${baoCaoDoiTuongId}`,
    );
  }

  async getSubmissionStatusSummary(nam: number) {
    return apiService.get<any>(
      `/BCSubmission/GetSubmissionStatusSummary?nam=${nam}`,
    );
  }

  async exportExcel(data: {
    idDoiTuongBaoCao?: string | null;
    idDotBaoCao?: string | null;
    thang?: number | null;
    nam?: number | null;
  }) {
    return apiService.post<Blob>(
      "/BCSubmission/ExportExcel",
      {
        idDotBaoCao: data.idDotBaoCao,
        idDoiTuongBaoCao: data.idDoiTuongBaoCao,
        thang: data.thang,
        nam: data.nam,
      },
      {
        responseType: "blob",
      },
    );
  }
}

const bcSubmissionService = BcSubmissionService.instance;
export default bcSubmissionService;
