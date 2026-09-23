import { ApiResponse, DropdownOption, DropdownOptionTree } from "@/types/general";
import { apiService } from "../index";
import DepartmentServiceGenerated from "../generated/departmentService.generated";

class DepartmentService extends DepartmentServiceGenerated {
  private static _instance: DepartmentService;
  public static get instance(): DepartmentService {
    if (!DepartmentService._instance) {
      DepartmentService._instance = new DepartmentService();
    }
    return DepartmentService._instance;
  }

  public async getDropdownDonVi(): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/Department/GetDropdownDonVi`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdownTrucThuocBTC(): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const response = await apiService.get<DropdownOption[]>(
        `/Department/GetDropdownTrucThuocBTC`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdownTreeUnderMinistryRoot(): Promise<ApiResponse<DropdownOptionTree[]>> {
    try {
      const response = await apiService.get<DropdownOptionTree[]>(
        `/Department/GetDropdownTreeUnderMinistryRoot`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDropdownLevel1(donViSuDungId?: string): Promise<ApiResponse<DropdownOption[]>> {
    try {
      const url = donViSuDungId 
        ? `/Department/GetDropdownLevel1?donViSuDungId=${donViSuDungId}`
        : `/Department/GetDropdownLevel1`;
      const response = await apiService.get<DropdownOption[]>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getCurrentAndChildDropdown(
    id: string,
    disabledParent: boolean = false
  ): Promise<ApiResponse<DropdownOptionTree[]>> {
    try {
      const response = await apiService.get<DropdownOptionTree[]>(
        `/Department/GetCurrentAndChildDropdown/${id}?disabledParent=${disabledParent}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async importExcelDirect(
    file: File,
    startRow: number = 2
  ): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiService.post<any>(
        `/Department/ImportExcelDirect?startRow=${startRow}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}
const departmentService = DepartmentService.instance;
export default departmentService;
