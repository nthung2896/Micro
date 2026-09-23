import {
  DepartmentHierarchyType,
  DepartmentType,
} from "@/types/department/dto";
import {
  DepartmentRequestType,
  DepartmentSaveRequestType,
  DepartmentSearchType,
} from "@/types/department/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class DepartmentServiceGenerated {
  public async saveDepartmentChanges(
    departments: DepartmentSaveRequestType[]
  ): Promise<ApiResponse<DepartmentType[]>> {
    try {
      const response = await apiService.post<DepartmentType[]>(
        `/Department/SaveDepartmentChanges`,
        departments
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async create(
    model: DepartmentRequestType
  ): Promise<ApiResponse<DepartmentType>> {
    try {
      const response = await apiService.post<DepartmentType>(
        `/Department/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: DepartmentRequestType
  ): Promise<ApiResponse<DepartmentType>> {
    try {
      const response = await apiService.put<DepartmentType>(
        `/Department/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<DepartmentType>> {
    try {
      const response = await apiService.get<DepartmentType>(
        `/Department/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: DepartmentSearchType
  ): Promise<ApiResponse<PagedList<DepartmentType>>> {
    try {
      const response = await apiService.post<PagedList<DepartmentType>>(
        `/Department/GetData`,
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
        `/Department/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async deactive(
    id: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.put(
        `/Department/deactive/${id}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDepartmentsWithHierarchy(
  ): Promise<ApiResponse<DepartmentHierarchyType[]>> {
    try {
      const response = await apiService.get<DepartmentHierarchyType[]>(
        `/Department/GetDepartmentsWithHierarchy`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropDepartment(
    selected?: string
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.post<DropdownOption[]>(
        `/Department/GetDropDepartment?selected=${selected}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropDownPhong(
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/Department/GetDropDownPhong`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async exportExcel(
    type: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.get(
        `/Department/export?type=${type}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getHierarchicalDropdownList(
    disabledParent: boolean
  ): Promise<ApiResponse<DropdownOptionTree[]>> {
    try {
      const response = await apiService.get<DropdownOptionTree[]>(
        `/Department/GetHierarchicalDropdownList?disabledParent=${disabledParent}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdownListByUserDepartment(
    disabledParent: boolean
  ): Promise<ApiResponse<DropdownOptionTree[]>> {
    try {
      const response = await apiService.get<DropdownOptionTree[]>(
        `/Department/GetDropdownListByUserDepartment?disabledParent=${disabledParent}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdownListKCQCN(
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/Department/GetDropdownListKCQCN`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async gropdownDownPhongByKCQCN(
    ids: string
  ): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/Department/GropdownDownPhongByKCQCN?ids=${ids}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getSubAndCurrentUnitDropdown(
    disabledParent: boolean
  ): Promise<ApiResponse<DropdownOptionTree[]>> {
    try {
      const response = await apiService.get<DropdownOptionTree[]>(
        `/Department/ImportLiveFile?disabledParent=${disabledParent}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default DepartmentServiceGenerated;
