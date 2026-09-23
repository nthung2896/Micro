import { BCFormTemplateType, BCThanhPhanFormType } from "@/types/bcFormTemplate/dto";
import { UpdateFormInputsRequest, UpdateInputDropdownRequest } from "@/types/bcFormTemplate/request";
import { ApiResponse } from "@/types/general";
import { apiService } from "../index";
import BCFormTemplateServiceGenerated from "../generated/bCFormTemplateService.generated";

class BCFormTemplateService extends BCFormTemplateServiceGenerated {
  private static _instance: BCFormTemplateService;
  public static get instance(): BCFormTemplateService {
    if (!BCFormTemplateService._instance) {
      BCFormTemplateService._instance = new BCFormTemplateService();
    }
    return BCFormTemplateService._instance;
  }

  /**
   * Cập nhật cấu hình thành phần forms (inputs) của một form template
   */
  public async updateCauHinh(
    model: {
      id: string;
      thanhPhanForms: BCThanhPhanFormType[];
    }
  ): Promise<ApiResponse<BCFormTemplateType>> {
    try {
      const response = await apiService.put<BCFormTemplateType>(
        `/BCFormTemplate/UpdateCauHinh`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật nhanh cấu hình key
   */
  public async updateConfigKey(
    model: UpdateFormInputsRequest
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.put<any>(
        `/BCFormTemplate/Config-Key`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật riêng lẻ cấu hình Combobox
   */
  public async updateDropdownInput(
    model: UpdateInputDropdownRequest
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.put<any>(
        `/BCFormTemplate/Config-Key-Dropdown`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

const bcFormTemplateService = BCFormTemplateService.instance;
export default bcFormTemplateService;
