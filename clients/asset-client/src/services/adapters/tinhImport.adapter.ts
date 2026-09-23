import { apiService } from "@/services";
import { uploadFileService } from "@/services/common/uploadFile.service";
import { ApiResponse, DataImport } from "@/types/general";
import { ImportAdapter } from "@/types/ImportExcel/import";

export const tinhImportAdapter: ImportAdapter = {
  exportTemplateImport: () =>
    apiService.get<string>(`/Tinh/ExportTemplateImport`),
  uploadFile: (formData) =>
    uploadFileService.upload(formData) as Promise<ApiResponse<any>>,
  importColumns: () => apiService.get<any>(`/Tinh/Import`),
  importExcel: (data: DataImport) =>
    apiService.post<any>(`/Tinh/ImportExcel`, data),
  save: (rows: any[]) => apiService.post<any>(`/Tinh/SaveImport`, rows),
};
