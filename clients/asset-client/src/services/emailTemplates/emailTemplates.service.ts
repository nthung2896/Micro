import { apiService } from "@/services/index";
import { PagedList } from "@/types/general";
import { EmailTemplatesDto, EmailTemplatesSearch, EmailTemplatesRequest } from "@/types/emailTemplates";

class EmailTemplatesService {
  private static _instance: EmailTemplatesService;
  public static get instance(): EmailTemplatesService {
    if (!EmailTemplatesService._instance) EmailTemplatesService._instance = new EmailTemplatesService();
    return EmailTemplatesService._instance;
  }

  async getData(search: EmailTemplatesSearch) {
    return apiService.post<PagedList<EmailTemplatesDto>>("/EmailTemplates/GetData", search);
  }
  async getById(id: string) {
    return apiService.get<EmailTemplatesDto>(`/EmailTemplates/Get/${id}`);
  }
  async create(data: EmailTemplatesRequest) {
    return apiService.post<{ id: string }>("/EmailTemplates/Create", data);
  }
  async update(data: EmailTemplatesRequest) {
    return apiService.put<{ id: string }>("/EmailTemplates/Update", data);
  }
  async delete(id: string) {
    return apiService.delete<any>(`/EmailTemplates/Delete/${id}`);
  }
}

const emailTemplatesService = EmailTemplatesService.instance;
export default emailTemplatesService;
