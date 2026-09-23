import { ApiResponse } from "@/types/general";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

declare global {
  interface Window {
    __APP_AREA?: string;
  }
}

export class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor() {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const cleanApiUrl = rawApiUrl.replace(/\/$/, "");
    const baseURL = cleanApiUrl.includes("/api")
      ? cleanApiUrl
      : `${cleanApiUrl}/api`;

    this.api = axios.create({
      baseURL: baseURL,
      timeout: 0, // Không giới hạn thời gian chờ
    });

    this.api.interceptors.request.use((config) => {
      config.headers["x-client-area"] = window.__APP_AREA || "dashboard";
      return config;
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("AccessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        const pathname = typeof window !== "undefined" ? (window.location.pathname || "/") : "/";
        const isDashboardRoute =
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/phongTro") ||
          pathname.startsWith("/tinh") ||
          pathname.startsWith("/huyen") ||
          pathname.startsWith("/xa") ||
          pathname.startsWith("/role") ||
          pathname.startsWith("/user") ||
          pathname.startsWith("/account") ||
          pathname.startsWith("/QL") ||
          pathname.startsWith("/appConfiguration") ||
          pathname.startsWith("/auditLog") ||
          pathname.startsWith("/groupUser") ||
          pathname.startsWith("/menu");
        const isPublicArea = window.__APP_AREA === "portal" || !isDashboardRoute;

        if (error.response?.status === 401) {
          localStorage.removeItem("AccessToken");
          if (!isPublicArea) {
            localStorage.setItem("redirect_url", window.location.href);
            window.location.href = "/auth/login";
          }
          return Promise.reject(error);
        }
        if (error.response?.status === 403) {
          // Không tự redirect — endpoint riêng lẻ trả 403 (vd admin-only) không có
          // nghĩa user mất quyền vào toàn hệ thống. Log lại và reject cho caller xử lý.
          console.warn(
            "API 403:",
            error.config?.url,
            "— user không có quyền với endpoint này (bỏ qua, không redirect).",
          );
          return Promise.reject(error.response?.data?.title || "Forbidden");
        }
        console.log(error);
        const responseData = error.response?.data;
        if (responseData instanceof Blob) {
          return responseData.text().then((text: string) => {
            try {
              const parsed = JSON.parse(text);
              return Promise.reject(parsed?.title || parsed?.message || error.message);
            } catch {
              return Promise.reject(error.message || "Không thể kết nối tới máy chủ");
            }
          });
        }
        return Promise.reject(responseData?.title || responseData?.message || error.message);
      },
    );
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Các phương thức API với kiểu dữ liệu trả về
  public async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.get(
      url,
      config,
    );
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.post(
      url,
      data,
      config,
    );
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.put(
      url,
      data,
      config,
    );
    return response.data;
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(
      url,
      config,
    );
    return response.data;
  }

  public async getBlob(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.get(url, {
      ...config,
      responseType: "blob",
    });
    return response.data;
  }

  public async postBlob(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.post(url, data, {
      ...config,
      responseType: "blob",
    });
    return response.data;
  }
}

export const apiService = ApiService.getInstance();
