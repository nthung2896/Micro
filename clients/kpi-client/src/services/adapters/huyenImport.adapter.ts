import { apiService } from "@/services";
import { uploadFileService } from "@/services/common/uploadFile.service";
import { ApiResponse, DataImport } from "@/types/general";
import { ImportAdapter } from "@/types/ImportExcel/import";

export const huyenImportAdapter: ImportAdapter = {
  exportTemplateImport: () =>
    apiService.get<string>(`/Huyen/ExportTemplateImport`),
  uploadFile: (formData) =>
    uploadFileService.upload(formData) as Promise<ApiResponse<any>>,
  importColumns: () => apiService.get<any>(`/Huyen/Import`),
  importExcel: (data: DataImport) =>
    apiService.post<any>(`/Huyen/ImportExcel`, data),
  save: (rows: any[]) => apiService.post<any>(`/Huyen/SaveImport`, rows),
};
