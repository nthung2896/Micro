import { ApiResponse, DataImport } from "@/types/general";

export interface ImportAdapter {
  exportTemplateImport: () => Promise<ApiResponse<string>>;
  uploadFile: (formData: FormData) => Promise<ApiResponse<any>>;
  importColumns: () => Promise<ApiResponse<any>>;
  importExcel: (data: DataImport) => Promise<ApiResponse<any>>;
  save: (rows: any[]) => Promise<ApiResponse<any>>;
}
