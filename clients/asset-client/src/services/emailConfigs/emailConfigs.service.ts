import { apiService } from "@/services/index";
import { PagedList } from "@/types/general";
import {
  EmailConfigsDto,
  EmailConfigsRequest,
  EmailConfigsSearch,
} from "@/types/emailConfigs";

class EmailConfigsService {
  private static _instance: EmailConfigsService;

  public static get instance(): EmailConfigsService {
    if (!EmailConfigsService._instance) {
      EmailConfigsService._instance = new EmailConfigsService();
    }
    return EmailConfigsService._instance;
  }

  async getData(search: EmailConfigsSearch) {
    return apiService.post<PagedList<EmailConfigsDto>>(
      "/EmailConfigs/GetData",
      search
    );
  }

  async getById(id: string) {
    return apiService.get<EmailConfigsDto>(`/EmailConfigs/Get/${id}`);
  }

  async create(data: EmailConfigsRequest) {
    return apiService.post<{ id: string }>("/EmailConfigs/Create", data);
  }

  async update(data: EmailConfigsRequest) {
    return apiService.put<{ id: string }>("/EmailConfigs/Update", data);
  }

  async delete(id: string) {
    return apiService.delete<any>(`/EmailConfigs/Delete/${id}`);
  }
}

const emailConfigsService = EmailConfigsService.instance;
export default emailConfigsService;
