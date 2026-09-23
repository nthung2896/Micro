import {
  UserPermissionType,
  UserRoleType,
  UserRoleVMType,
} from "@/types/userRole/dto";
import {
  UserRoleBulkRequestType,
  UserRoleRequest_GanNguoiType,
  UserRoleRequestType,
  UserRoleSearchType,
} from "@/types/userRole/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class UserRoleServiceGenerated {
  public async create(
    model: UserRoleRequestType
  ): Promise<ApiResponse<UserRoleType>> {
    try {
      const response = await apiService.post<UserRoleType>(
        `/UserRole/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: UserRoleRequestType
  ): Promise<ApiResponse<UserRoleType>> {
    try {
      const response = await apiService.post<UserRoleType>(
        `/UserRole/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<UserRoleType>> {
    try {
      const response = await apiService.get<UserRoleType>(
        `/UserRole/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: UserRoleSearchType
  ): Promise<ApiResponse<PagedList<UserRoleType>>> {
    try {
      const response = await apiService.post<PagedList<UserRoleType>>(
        `/UserRole/GetData`,
        search
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
        `/UserRole/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async createNew(
    model: UserRoleRequest_GanNguoiType
  ): Promise<ApiResponse<UserRoleType[]>> {
    try {
      const response = await apiService.post<UserRoleType[]>(
        `/UserRole/CreateNew`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async setupRole(
    id: string
  ): Promise<ApiResponse<UserRoleVMType>> {
    try {
      const response = await apiService.post<UserRoleVMType>(
        `/UserRole/SetupRole?id=${id}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async createBulk(
    model: UserRoleBulkRequestType
  ): Promise<ApiResponse<UserRoleType[]>> {
    try {
      const response = await apiService.post<UserRoleType[]>(
        `/UserRole/CreateBulk`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdownKCQCN(
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/UserRole/GetDropdownKCQCN`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdownPhongByKCQCN(
    codes: string
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/UserRole/GetDropdownPhongByKCQCN?codes=${codes}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getUserPermissions(
    userId: string
  ): Promise<ApiResponse<UserPermissionType[]>> {
    try {
      const response = await apiService.get<UserPermissionType[]>(
        `/UserRole/GetUserPermissions/${userId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default UserRoleServiceGenerated;
