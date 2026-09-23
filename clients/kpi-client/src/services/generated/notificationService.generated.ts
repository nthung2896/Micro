import {
  NotificationType,
} from "@/types/notification/dto";
import {
  NotificationNhacNhoRequestType,
  NotificationRequestType,
  NotificationSearchType,
} from "@/types/notification/request";
import { ApiResponse, PagedList, DropdownOption, DropdownOptionTree, Dictionary, DataImport} from "@/types/general";
import { apiService } from "../index";

class NotificationServiceGenerated {
  public async create(
    model: NotificationRequestType
  ): Promise<ApiResponse<NotificationType>> {
    try {
      const response = await apiService.post<NotificationType>(
        `/Notification/Create`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async createNhacNho(
    model: NotificationNhacNhoRequestType
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiService.post<boolean>(
        `/Notification/CreateNhacNho`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async update(
    model: NotificationRequestType
  ): Promise<ApiResponse<NotificationType>> {
    try {
      const response = await apiService.put<NotificationType>(
        `/Notification/Update`,
        model
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async get(
    id: string
  ): Promise<ApiResponse<NotificationType>> {
    try {
      const response = await apiService.get<NotificationType>(
        `/Notification/Get/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getData(
    search: NotificationSearchType
  ): Promise<ApiResponse<PagedList<NotificationType>>> {
    try {
      const response = await apiService.post<PagedList<NotificationType>>(
        `/Notification/GetData`,
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
        `/Notification/Delete/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getNotification(
    search: NotificationSearchType
  ): Promise<ApiResponse<PagedList<NotificationType>>> {
    try {
      const response = await apiService.post<PagedList<NotificationType>>(
        `/Notification/GetNotification`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getNotificationUser(
  ): Promise<ApiResponse<PagedList<NotificationType>>> {
    try {
      const response = await apiService.post<PagedList<NotificationType>>(
        `/Notification/GetNotificationUser`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDataDoanhNghiep(
    search: NotificationSearchType
  ): Promise<ApiResponse<PagedList<NotificationType>>> {
    try {
      const response = await apiService.post<PagedList<NotificationType>>(
        `/Notification/GetDataDoanhNghiep`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async getDataSanPham(
    search: NotificationSearchType
  ): Promise<ApiResponse<PagedList<NotificationType>>> {
    try {
      const response = await apiService.post<PagedList<NotificationType>>(
        `/Notification/GetDataSanPham`,
        search
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async toggleLock(
    id: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.get(
        `/Notification/ToggleLock/${id}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async maskAsRead(
    id: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.put(
        `/Notification/MaskAsRead/${id}`,
        null
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  public async clearAllNotification(
  ): Promise<ApiResponse> {
    try {
      const response = await apiService.delete(
        `/Notification/ClearAll`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

}

export default NotificationServiceGenerated;
