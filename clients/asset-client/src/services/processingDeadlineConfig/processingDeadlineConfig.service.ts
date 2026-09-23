import { apiService } from "@/services/index";
import { PagedList } from "@/types/general";
import {
  ProcessingDeadlineConfigDto,
  ProcessingDeadlineConfigSearch,
  ProcessingDeadlineConfigCreateRequest
} from "@/types/processingDeadlineConfig";

class ProcessingDeadlineConfigService {
  private static _instance: ProcessingDeadlineConfigService;
  public static get instance(): ProcessingDeadlineConfigService {
    if (!ProcessingDeadlineConfigService._instance) ProcessingDeadlineConfigService._instance = new ProcessingDeadlineConfigService();
    return ProcessingDeadlineConfigService._instance;
  }

  async getData(search: ProcessingDeadlineConfigSearch) {
    return apiService.post<PagedList<ProcessingDeadlineConfigDto>>("/ProcessingDeadlineConfig/GetData", search);
  }
  async getById(id: string) {
    return apiService.get<ProcessingDeadlineConfigDto>(`/ProcessingDeadlineConfig/Get/${id}`);
  }
  async create(data: ProcessingDeadlineConfigCreateRequest) {
    return apiService.post<{ id: string }>("/ProcessingDeadlineConfig/Create", data);
  }
  async update(data: ProcessingDeadlineConfigCreateRequest) {
    return apiService.post<{ id: string }>("/ProcessingDeadlineConfig/Update", data);
  }
  async delete(id: string) {
    return apiService.delete<any>(`/ProcessingDeadlineConfig/Delete/${id}`);
  }
}

const processingDeadlineConfigService = ProcessingDeadlineConfigService.instance;
export default processingDeadlineConfigService;
