import { apiService } from "@/services";
import { ApiResponse } from "@/types/general";
import { FileValidationType } from "@/types/pdf/dto";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import axios, { AxiosInstance, AxiosResponse } from "axios";

class FileServerService {
  private static _instance: FileServerService;
  public static get instance(): FileServerService {
    if (!FileServerService._instance) {
      FileServerService._instance = new FileServerService();
    }
    return FileServerService._instance;
  }
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
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
          console.warn("FileServer 403:", error.config?.url);
          return Promise.reject(error.response?.data?.title || "Forbidden");
        }
        const data = error.response?.data;
        const msg =
          (typeof data === "string" && data) ||
          data?.title ||
          data?.message ||
          data?.detail ||
          error.message ||
          `HTTP ${error.response?.status ?? "error"}`;
        console.warn("FileServer error:", msg, error.response);
        return Promise.reject(new Error(msg));
      },
    );
  }

  public async upload(
    formData: FormData,
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response: AxiosResponse<ApiResponse<TaiLieuDinhKemType[]>> =
        await this.api.post(`/api/TaiLieuDinhKem/upload`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async uploadFiles(
    files: File[],
    opts: {
      category: string;
      subCategory?: string;
      taxCode?: string;
      itemId?: string;
      loaiTaiLieu?: string;
      serialNumber?: string;
      requiredKySo?: boolean;
      includeExportInfo?: boolean;
    },
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    const fd = new FormData();
    files.forEach((f) => fd.append("Files", f));
    fd.append("FileType", opts.category);
    if (opts.itemId) fd.append("ItemId", opts.itemId);
    return this.upload(fd);
  }

  public async get(id: string): Promise<ApiResponse<TaiLieuDinhKemType>> {
    try {
      const response: AxiosResponse<ApiResponse<TaiLieuDinhKemType>> =
        await this.api.get(`/api/TaiLieuDinhKem/GetFileInfo/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  public async getByItemId(
    itemId: string,
  ): Promise<ApiResponse<TaiLieuDinhKemType[]>> {
    try {
      const response: AxiosResponse<ApiResponse<TaiLieuDinhKemType[]>> =
        await this.api.get(`/api/TaiLieuDinhKem/GetByItemId/${itemId}`);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public async getLatestByItemId(
    itemId: string,
    loaiTaiLieu?: string,
  ): Promise<TaiLieuDinhKemType | null> {
    const res = await this.getByItemId(itemId);
    let list = res.data ?? [];
    if (loaiTaiLieu) list = list.filter((t) => t.loaiTaiLieu === loaiTaiLieu);
    if (!list.length) return null;
    return [...list].sort((a, b) => {
      const av = a.createdDate ? new Date(a.createdDate).getTime() : 0;
      const bv = b.createdDate ? new Date(b.createdDate).getTime() : 0;
      return bv - av;
    })[0];
  }

  public async getUrlByItemId(
    itemId: string,
    loaiTaiLieu?: string,
  ): Promise<string | null> {
    const t = await this.getLatestByItemId(itemId, loaiTaiLieu);
    return t ? this.getUrl(t) : null;
  }

  public async delete(ids: string[]): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.delete(
        `/api/TaiLieuDinhKem/delete`,
        { data: { ids } },
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public getUrl(taiLieu: TaiLieuDinhKemType): string;
  public getUrl(id: string, fileName: string): string;
  public getUrl(param1: any, param2?: any): string {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    if (typeof param1 === "object" && param1.id && param1.tenTaiLieu) {
      const path = param1.duongDanFile;
      if (path && path.startsWith("/uploads/")) return `${apiBase}${path}`;
      if (path && path.startsWith("uploads/")) return `${apiBase}/${path}`;
      return `${apiBase}/uploads/${path}`;
    }
    if (typeof param1 === "string" && typeof param2 === "string") {
      // fallback when only string ID and name is provided
      // Usually frontend calls getUrl(file) instead
      return `${apiBase}/api/TaiLieuDinhKem/download/${param1}`;
    }

    throw new Error("Invalid arguments");
  }
}

const fileServerService = FileServerService.instance;
export default fileServerService;
