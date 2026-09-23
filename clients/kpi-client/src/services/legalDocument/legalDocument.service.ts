import { apiService } from "@/services/index";
import { PagedList } from "@/types/general";
import { LegalDocumentDto, LegalDocumentSearch, LegalDocumentCreateRequest } from "@/types/legalDocument";

class LegalDocumentService {
  private static _instance: LegalDocumentService;
  public static get instance(): LegalDocumentService {
    if (!LegalDocumentService._instance) LegalDocumentService._instance = new LegalDocumentService();
    return LegalDocumentService._instance;
  }

  async getData(search: LegalDocumentSearch) {
    return apiService.post<PagedList<LegalDocumentDto>>("/LegalDocument/GetData", search);
  }
  async getPublicData(search: LegalDocumentSearch) {
    return apiService.post<PagedList<LegalDocumentDto>>("/LegalDocument/GetPublicData", search);
  }
  async getById(id: string) {
    return apiService.get<LegalDocumentDto>(`/LegalDocument/Get/${id}`);
  }
  async create(data: LegalDocumentCreateRequest) {
    return apiService.post<{ id: string }>("/LegalDocument/Create", data);
  }
  async update(data: LegalDocumentCreateRequest) {
    return apiService.post<{ id: string }>("/LegalDocument/Update", data);
  }
  async updateStatus(id: string, status: string) {
    return apiService.put<any>(`/LegalDocument/UpdateStatus/${id}/${status}`);
  }
  async updateStatusMultiple(ids: string[], status: string) {
    return apiService.put<any>("/LegalDocument/UpdateStatusMultiple", { ids, status });
  }
  async delete(id: string) {
    return apiService.delete<any>(`/LegalDocument/Delete/${id}`);
  }
}

const legalDocumentService = LegalDocumentService.instance;
export default legalDocumentService;
