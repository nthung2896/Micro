import {
  RutTienKyQuyType,
  SpecialistDto,
} from "@/types/rutTienKyQuy/dto";
import {
  AssignRequest,
  RutTienKyQuySaveRequestType,
  RutTienKyQuySearchType,
  TransitionRequest,
} from "@/types/rutTienKyQuy/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class RutTienKyQuyServiceGenerated {
  public async getData(
    search: RutTienKyQuySearchType
  ): Promise<ApiResponse<PagedList<RutTienKyQuyType>>> {
    try {
      const response = await apiService.post<PagedList<RutTienKyQuyType>>(
        `/RutTienKyQuy/GetData`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getStatusCounts(
    search: RutTienKyQuySearchType
  ): Promise<ApiResponse<Dictionary<number>>> {
    try {
      const response = await apiService.post<Dictionary<number>>(
        `/RutTienKyQuy/GetStatusCounts`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<RutTienKyQuyType>> {
    try {
      const response = await apiService.get<RutTienKyQuyType>(
        `/RutTienKyQuy/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async create(
    request: RutTienKyQuySaveRequestType
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.post<any>(
        `/RutTienKyQuy/Create`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    request: RutTienKyQuySaveRequestType
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.put<any>(
        `/RutTienKyQuy/Update`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async delete(
    id: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.delete(
        `/RutTienKyQuy/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async transition(
    request: TransitionRequest
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.post<boolean>(
        `/RutTienKyQuy/Transition`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async assign(
    request: AssignRequest
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.post<boolean>(
        `/RutTienKyQuy/Assign`,
        request
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async selfAssign(
    id: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.post<boolean>(
        `/RutTienKyQuy/SelfAssign/${id}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getSpecialists(
  ): Promise<ApiResponse<SpecialistDto[]>> {
    try {
      const response = await apiService.get<SpecialistDto[]>(
        `/RutTienKyQuy/GetSpecialists`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default RutTienKyQuyServiceGenerated;
