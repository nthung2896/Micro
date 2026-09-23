import { apiService } from "@/services";
import {
  DataImport,
  Dictionary,
  DropdownOption,
  Response,
  ResponsePageList,
} from "@/types/general";
import {
  KPI_NhomTieuChiCreateOrUpdateType,
  KPI_NhomTieuChiSearchType,
  KPI_NhomTieuChiType,
  ImportResponseType,
  KPI_BoTieuChiDonViImportVMType,
} from "@/types/kPI_NhomTieuChi/kPI_NhomTieuChi";

class KPI_NhomTieuChiService {
  private static _instance: KPI_NhomTieuChiService;
  public static get instance(): KPI_NhomTieuChiService {
    if (!KPI_NhomTieuChiService._instance) {
      KPI_NhomTieuChiService._instance = new KPI_NhomTieuChiService();
    }
    return KPI_NhomTieuChiService._instance;
  }

  public async getData(
    searchData: KPI_NhomTieuChiSearchType
  ): Promise<Response<ResponsePageList<KPI_NhomTieuChiType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_NhomTieuChiType[]>>
    >("/kPI_NhomTieuChi/getData", searchData);
    return response as any;
  }

  public async getDataElasticExact(
    searchData: KPI_NhomTieuChiSearchType
  ): Promise<Response<ResponsePageList<KPI_NhomTieuChiType[]>>> {
    const response = await apiService.post<
      Response<ResponsePageList<KPI_NhomTieuChiType[]>>
    >("/kPI_NhomTieuChi/getDataElasticExact", searchData);
    return response as any;
  }

  public async getTop3DeXuatTieuChiElastic(tenNhiemVu?: string, tenSanPham?: string, idBoTieuChiDonVi?: string | null, relatedIds?: string[]): Promise<Response<KPI_NhomTieuChiType[]>> {
    const params = new URLSearchParams();
    if (tenNhiemVu) params.append("tenNhiemVu", tenNhiemVu);
    if (tenSanPham) params.append("tenSanPham", tenSanPham);
    if (idBoTieuChiDonVi) params.append("idBoTieuChiDonVi", idBoTieuChiDonVi);
    if (relatedIds && relatedIds.length > 0) {
      relatedIds.forEach(id => params.append("relatedIds", id));
    }

    let url = `/kPI_NhomTieuChi/GetTop3DeXuatTieuChiElastic?${params.toString()}`;
    const response = await apiService.get<Response<KPI_NhomTieuChiType[]>>(url);
    return response as any;
  }

  public async getDeXuatTieuChiElastic(tenNhiemVu?: string, tenSanPham?: string, idBoTieuChiDonVi?: string | null, relatedIds?: string[]): Promise<Response<string[]>> {
    const params = new URLSearchParams();
    if (tenNhiemVu) params.append("tenNhiemVu", tenNhiemVu);
    if (tenSanPham) params.append("tenSanPham", tenSanPham);
    if (idBoTieuChiDonVi) params.append("idBoTieuChiDonVi", idBoTieuChiDonVi);
    if (relatedIds && relatedIds.length > 0) {
      relatedIds.forEach(id => params.append("relatedIds", id));
    }

    let url = `/kPI_NhomTieuChi/GetDeXuatTieuChiElastic?${params.toString()}`;
    const response = await apiService.get<Response<string[]>>(url);
    return response as any;
  }



  public async getTieuChiForCurrentUser(
    donViId?: string,
    idDotDanhGia?: string | null,
    idLyLich?: string | null
  ): Promise<Response<KPI_NhomTieuChiType[]>> {
    let url = "/kPI_NhomTieuChi/getTieuChiForCurrentUser";
    const params = new URLSearchParams();
    if (donViId) {
      params.append("donViId", donViId);
    }
    if (idDotDanhGia) {
      params.append("idDotDanhGia", idDotDanhGia);
    }
    if (idLyLich) {
      params.append("idLyLich", idLyLich);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await apiService.get<Response<KPI_NhomTieuChiType[]>>(url);
    return response as any;
  }

  public async getTieuChiForTCCB(
    donViId?: string,
    idDotDanhGia?: string | null,
    idLyLich?: string | null
  ): Promise<Response<KPI_NhomTieuChiType[]>> {
    let url = "/kPI_NhomTieuChi/GetTieuChiForTCCB";
    const params = new URLSearchParams();
    if (donViId) {
      params.append("donViId", donViId);
    }
    if (idDotDanhGia) {
      params.append("idDotDanhGia", idDotDanhGia);
    }
    if (idLyLich) {
      params.append("idLyLich", idLyLich);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await apiService.get<Response<KPI_NhomTieuChiType[]>>(url);
    return response as any;
  }

  public async getTreeDataForDot(
    idDot: string,
    idLyLich?: string | null,
    idPhieuDanhGia?: string | null
  ): Promise<Response<KPI_NhomTieuChiType[]>> {
    let url = `/kPI_NhomTieuChi/GetTreeDataForDot?idDot=${idDot}`;
    if (idLyLich) {
      url += `&idLyLich=${idLyLich}`;
    }
    if (idPhieuDanhGia) {
      url += `&idPhieuDanhGia=${idPhieuDanhGia}`;
    }
    const response = await apiService.get<Response<KPI_NhomTieuChiType[]>>(url);
    return response as any;
  }

  public async create(
    formData: KPI_NhomTieuChiCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_NhomTieuChi/create",
      formData
    );
    return response as any;
  }

  public async update(
    formData: KPI_NhomTieuChiCreateOrUpdateType
  ): Promise<Response> {
    const response = await apiService.put<Response>(
      "/kPI_NhomTieuChi/update",
      formData
    );
    return response as any;
  }

  public async delete(id: string): Promise<Response> {
    const response = await apiService.delete<Response>(
      "/kPI_NhomTieuChi/delete/" + id
    );
    return response as any;
  }
  public async getDropdowns(): Promise<Response<Dictionary<DropdownOption[]>>> {
    const response = await apiService.get<Response<Dictionary<DropdownOption[]>>>(
      "/kPI_NhomTieuChi/getDropDowns"
    );
    return response as any;
  }

  public async exportExcel(
    search: KPI_NhomTieuChiSearchType
  ): Promise<Response<string>> {
    const response = await apiService.post<Response>(
      "/kPI_NhomTieuChi/exportExcel",
      search
    );
    return response as any;
  }

  public async exportTemplateImport(): Promise<Response> {
    const response = await apiService.get<Response>(
      "/kPI_NhomTieuChi/exportTemplateImport"
    );
    return response as any;
  }

  public async getDataImportView(): Promise<Response> {
    const response = await apiService.get<Response>("/KPI_NhomTieuChi/import");
    return response as any;
  }

  public async saveImport(form: DataImport): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_NhomTieuChi/importExcel",
      form
    );
    return response as any;
  }

  public async checkFileWorksheet(file: File): Promise<Response<string[] | null>> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiService.post<Response<string[] | null>>(
      "/kPI_NhomTieuChi/CheckFileWorksheet",
      formData
    );
    return response as any;
  }

  public async getHeaderWorksheet(file: File, workSheetName: string): Promise<Response<any>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("WorkSheetName", workSheetName);
    const response = await apiService.post<Response<any>>(
      "/kPI_NhomTieuChi/GetHeaderWorksheet",
      formData
    );
    return response as any;
  }

  public async importExcelDirect(
    file: File,
    data?: KPI_BoTieuChiDonViImportVMType
  ): Promise<Response<ImportResponseType>> {
    const formData = new FormData();
    formData.append("file", file);
    if (data) {
      if (data.RowStart !== undefined && data.RowStart !== null) {
        formData.append("RowStart", data.RowStart.toString());
        formData.append("data.RowStart", data.RowStart.toString());
      }
      if (data.RowName !== undefined && data.RowName !== null) {
        formData.append("RowName", data.RowName.toString());
        formData.append("data.RowName", data.RowName.toString());
      }
      if (data.RowInfo !== undefined && data.RowInfo !== null) {
        formData.append("RowInfo", data.RowInfo.toString());
        formData.append("data.RowInfo", data.RowInfo.toString());
      }
      if (data.IdDonVi) {
        formData.append("IdDonVi", data.IdDonVi);
        formData.append("data.IdDonVi", data.IdDonVi);
      }
      if (data.IdDot) {
        formData.append("IdDot", data.IdDot);
        formData.append("data.IdDot", data.IdDot);
      }
      if (data.ApDungTuNgay) {
        formData.append("ApDungTuNgay", data.ApDungTuNgay);
        formData.append("data.ApDungTuNgay", data.ApDungTuNgay);
      }
      if (data.ApDungToiNgay) {
        formData.append("ApDungToiNgay", data.ApDungToiNgay);
        formData.append("data.ApDungToiNgay", data.ApDungToiNgay);
      }
      if (data.SoQuyetDinh) {
        formData.append("SoQuyetDinh", data.SoQuyetDinh);
        formData.append("data.SoQuyetDinh", data.SoQuyetDinh);
      }
      if (data.NgayQuyetDinh) {
        formData.append("NgayQuyetDinh", data.NgayQuyetDinh);
        formData.append("data.NgayQuyetDinh", data.NgayQuyetDinh);
      }
      if (data.TenBoTieuChiDonVi) {
        formData.append("TenBoTieuChiDonVi", data.TenBoTieuChiDonVi);
        formData.append("data.TenBoTieuChiDonVi", data.TenBoTieuChiDonVi);
      }
      if (data.TotalColumns !== undefined && data.TotalColumns !== null) {
        formData.append("TotalColumns", data.TotalColumns.toString());
        formData.append("data.TotalColumns", data.TotalColumns.toString());
      }
      if ((data as any).StartCol !== undefined && (data as any).StartCol !== null) {
        formData.append("StartCol", (data as any).StartCol.toString());
        formData.append("data.StartCol", (data as any).StartCol.toString());
      }
      if ((data as any).Headers && Array.isArray((data as any).Headers)) {
        (data as any).Headers.forEach((header: any, index: number) => {
          const hName = header.name || header.Name;
          const hRow = header.row !== undefined ? header.row : header.Row;
          const hCol = header.col !== undefined ? header.col : header.Col;
          if (hName) formData.append(`Headers[${index}].Name`, hName);
          if (hRow !== undefined) formData.append(`Headers[${index}].Row`, hRow.toString());
          if (hCol !== undefined) formData.append(`Headers[${index}].Col`, hCol.toString());
          
          if (hName) formData.append(`data.Headers[${index}].Name`, hName);
          if (hRow !== undefined) formData.append(`data.Headers[${index}].Row`, hRow.toString());
          if (hCol !== undefined) formData.append(`data.Headers[${index}].Col`, hCol.toString());
        });
      }
      if ((data as any).WorkSheetName) {
        formData.append("WorkSheetName", (data as any).WorkSheetName);
        formData.append("data.WorkSheetName", (data as any).WorkSheetName);
      }
    }
    const response = await apiService.post<Response<ImportResponseType>>(
      "/kPI_NhomTieuChi/ImportExcelDirect",
      formData
    );
    return response as any;
  }

  public async importExcelVuDonVi(
    file: File,
    data?: KPI_BoTieuChiDonViImportVMType | null
  ): Promise<Response<ImportResponseType>> {
    const formData = new FormData();
    formData.append("file", file);
    if (data) {
      if (data.RowStart !== undefined && data.RowStart !== null) {
        formData.append("RowStart", data.RowStart.toString());
        formData.append("data.RowStart", data.RowStart.toString());
      }
      if (data.RowName !== undefined && data.RowName !== null) {
        formData.append("RowName", data.RowName.toString());
        formData.append("data.RowName", data.RowName.toString());
      }
      if (data.RowInfo !== undefined && data.RowInfo !== null) {
        formData.append("RowInfo", data.RowInfo.toString());
        formData.append("data.RowInfo", data.RowInfo.toString());
      }
      if (data.TotalColumns !== undefined && data.TotalColumns !== null) {
        formData.append("TotalColumns", data.TotalColumns.toString());
        formData.append("data.TotalColumns", data.TotalColumns.toString());
      }
      if (data.TenBoTieuChiDonVi) {
        formData.append("TenBoTieuChiDonVi", data.TenBoTieuChiDonVi);
        formData.append("data.TenBoTieuChiDonVi", data.TenBoTieuChiDonVi);
      }
      if (data.IdDonVi) {
        formData.append("IdDonVi", data.IdDonVi.toString());
        formData.append("data.IdDonVi", data.IdDonVi.toString());
      }
      if (data.IdDot) {
        formData.append("IdDot", data.IdDot.toString());
        formData.append("data.IdDot", data.IdDot.toString());
      }
      if (data.SoQuyetDinh) {
        formData.append("SoQuyetDinh", data.SoQuyetDinh);
        formData.append("data.SoQuyetDinh", data.SoQuyetDinh);
      }
      if (data.NgayQuyetDinh) {
        formData.append("NgayQuyetDinh", (data.NgayQuyetDinh as any).toISOString ? (data.NgayQuyetDinh as any).toISOString() : data.NgayQuyetDinh.toString());
        formData.append("data.NgayQuyetDinh", (data.NgayQuyetDinh as any).toISOString ? (data.NgayQuyetDinh as any).toISOString() : data.NgayQuyetDinh.toString());
      }
      if (data.ApDungTuNgay) {
        formData.append("ApDungTuNgay", (data.ApDungTuNgay as any).toISOString ? (data.ApDungTuNgay as any).toISOString() : data.ApDungTuNgay.toString());
        formData.append("data.ApDungTuNgay", (data.ApDungTuNgay as any).toISOString ? (data.ApDungTuNgay as any).toISOString() : data.ApDungTuNgay.toString());
      }
      if (data.ApDungToiNgay) {
        formData.append("ApDungToiNgay", (data.ApDungToiNgay as any).toISOString ? (data.ApDungToiNgay as any).toISOString() : data.ApDungToiNgay.toString());
        formData.append("data.ApDungToiNgay", (data.ApDungToiNgay as any).toISOString ? (data.ApDungToiNgay as any).toISOString() : data.ApDungToiNgay.toString());
      }
      if ((data as any).WorkSheetName) {
        formData.append("WorkSheetName", (data as any).WorkSheetName);
        formData.append("data.WorkSheetName", (data as any).WorkSheetName);
      }
    }
    const response = await apiService.post<Response<ImportResponseType>>(
      "/kPI_NhomTieuChi/ImportExcelVuDonVi",
      formData
    );
    return response as any;
  }

  // --- V2 Import Methods ---
  public async checkFileWorksheetV2(file: File): Promise<Response<string[]>> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiService.post<Response<string[]>>(
      "/kPI_NhomTieuChi/CheckFileWorksheetV2",
      formData
    );
    return response as any;
  }

  public async getHeaderWorksheetV2(file: File, workSheetName: string): Promise<Response<any>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("WorkSheetName", workSheetName);
    const response = await apiService.post<Response<any>>(
      "/kPI_NhomTieuChi/GetHeaderWorksheetV2",
      formData
    );
    return response as any;
  }

  public async importExcelDirectV2(
    file: File,
    data?: KPI_BoTieuChiDonViImportVMType
  ): Promise<Response<ImportResponseType>> {
    const formData = new FormData();
    formData.append("file", file);
    if (data) {
      if (data.RowStart !== undefined && data.RowStart !== null) {
        formData.append("RowStart", data.RowStart.toString());
        formData.append("data.RowStart", data.RowStart.toString());
      }
      if (data.RowName !== undefined && data.RowName !== null) {
        formData.append("RowName", data.RowName.toString());
        formData.append("data.RowName", data.RowName.toString());
      }
      if (data.RowInfo !== undefined && data.RowInfo !== null) {
        formData.append("RowInfo", data.RowInfo.toString());
        formData.append("data.RowInfo", data.RowInfo.toString());
      }
      if (data.IdDonVi) {
        formData.append("IdDonVi", data.IdDonVi);
        formData.append("data.IdDonVi", data.IdDonVi);
      }
      if (data.IdDot) {
        formData.append("IdDot", data.IdDot);
        formData.append("data.IdDot", data.IdDot);
      }
      if (data.ApDungTuNgay) {
        formData.append("ApDungTuNgay", data.ApDungTuNgay);
        formData.append("data.ApDungTuNgay", data.ApDungTuNgay);
      }
      if (data.ApDungToiNgay) {
        formData.append("ApDungToiNgay", data.ApDungToiNgay);
        formData.append("data.ApDungToiNgay", data.ApDungToiNgay);
      }
      if (data.SoQuyetDinh) {
        formData.append("SoQuyetDinh", data.SoQuyetDinh);
        formData.append("data.SoQuyetDinh", data.SoQuyetDinh);
      }
      if (data.NgayQuyetDinh) {
        formData.append("NgayQuyetDinh", data.NgayQuyetDinh);
        formData.append("data.NgayQuyetDinh", data.NgayQuyetDinh);
      }
      if (data.TenBoTieuChiDonVi) {
        formData.append("TenBoTieuChiDonVi", data.TenBoTieuChiDonVi);
        formData.append("data.TenBoTieuChiDonVi", data.TenBoTieuChiDonVi);
      }
      if (data.TotalColumns !== undefined && data.TotalColumns !== null) {
        formData.append("TotalColumns", data.TotalColumns.toString());
        formData.append("data.TotalColumns", data.TotalColumns.toString());
      }
      if ((data as any).StartCol !== undefined && (data as any).StartCol !== null) {
        formData.append("StartCol", (data as any).StartCol.toString());
        formData.append("data.StartCol", (data as any).StartCol.toString());
      }
      if ((data as any).Headers && Array.isArray((data as any).Headers)) {
        (data as any).Headers.forEach((header: any, index: number) => {
          const hName = header.name || header.Name;
          const hRow = header.row !== undefined ? header.row : header.Row;
          const hCol = header.col !== undefined ? header.col : header.Col;
          if (hName) formData.append(`Headers[${index}].Name`, hName);
          if (hRow !== undefined) formData.append(`Headers[${index}].Row`, hRow.toString());
          if (hCol !== undefined) formData.append(`Headers[${index}].Col`, hCol.toString());
          
          if (hName) formData.append(`data.Headers[${index}].Name`, hName);
          if (hRow !== undefined) formData.append(`data.Headers[${index}].Row`, hRow.toString());
          if (hCol !== undefined) formData.append(`data.Headers[${index}].Col`, hCol.toString());
        });
      }
      if ((data as any).WorkSheetName) {
        formData.append("WorkSheetName", (data as any).WorkSheetName);
        formData.append("data.WorkSheetName", (data as any).WorkSheetName);
      }
    }
    const response = await apiService.post<Response<ImportResponseType>>(
      "/kPI_NhomTieuChi/ImportExcelDirectV2",
      formData
    );
    return response as any;
  }

  public async importExcelVuDonViV2(
    file: File,
    data?: KPI_BoTieuChiDonViImportVMType | null
  ): Promise<Response<ImportResponseType>> {
    const formData = new FormData();
    formData.append("file", file);
    if (data) {
      if (data.RowStart !== undefined && data.RowStart !== null) {
        formData.append("RowStart", data.RowStart.toString());
        formData.append("data.RowStart", data.RowStart.toString());
      }
      if (data.RowName !== undefined && data.RowName !== null) {
        formData.append("RowName", data.RowName.toString());
        formData.append("data.RowName", data.RowName.toString());
      }
      if (data.RowInfo !== undefined && data.RowInfo !== null) {
        formData.append("RowInfo", data.RowInfo.toString());
        formData.append("data.RowInfo", data.RowInfo.toString());
      }
      if (data.TotalColumns !== undefined && data.TotalColumns !== null) {
        formData.append("TotalColumns", data.TotalColumns.toString());
        formData.append("data.TotalColumns", data.TotalColumns.toString());
      }
      if (data.TenBoTieuChiDonVi) {
        formData.append("TenBoTieuChiDonVi", data.TenBoTieuChiDonVi);
        formData.append("data.TenBoTieuChiDonVi", data.TenBoTieuChiDonVi);
      }
      if (data.IdDonVi) {
        formData.append("IdDonVi", data.IdDonVi.toString());
        formData.append("data.IdDonVi", data.IdDonVi.toString());
      }
      if (data.IdDot) {
        formData.append("IdDot", data.IdDot.toString());
        formData.append("data.IdDot", data.IdDot.toString());
      }
      if (data.SoQuyetDinh) {
        formData.append("SoQuyetDinh", data.SoQuyetDinh);
        formData.append("data.SoQuyetDinh", data.SoQuyetDinh);
      }
      if (data.NgayQuyetDinh) {
        formData.append("NgayQuyetDinh", (data.NgayQuyetDinh as any).toISOString ? (data.NgayQuyetDinh as any).toISOString() : data.NgayQuyetDinh.toString());
        formData.append("data.NgayQuyetDinh", (data.NgayQuyetDinh as any).toISOString ? (data.NgayQuyetDinh as any).toISOString() : data.NgayQuyetDinh.toString());
      }
      if (data.ApDungTuNgay) {
        formData.append("ApDungTuNgay", (data.ApDungTuNgay as any).toISOString ? (data.ApDungTuNgay as any).toISOString() : data.ApDungTuNgay.toString());
        formData.append("data.ApDungTuNgay", (data.ApDungTuNgay as any).toISOString ? (data.ApDungTuNgay as any).toISOString() : data.ApDungTuNgay.toString());
      }
      if (data.ApDungToiNgay) {
        formData.append("ApDungToiNgay", (data.ApDungToiNgay as any).toISOString ? (data.ApDungToiNgay as any).toISOString() : data.ApDungToiNgay.toString());
        formData.append("data.ApDungToiNgay", (data.ApDungToiNgay as any).toISOString ? (data.ApDungToiNgay as any).toISOString() : data.ApDungToiNgay.toString());
      }
      if ((data as any).WorkSheetName) {
        formData.append("WorkSheetName", (data as any).WorkSheetName);
        formData.append("data.WorkSheetName", (data as any).WorkSheetName);
      }
      if ((data as any).importMode || (data as any).ImportMode) {
        const mode = (data as any).importMode || (data as any).ImportMode;
        formData.append("importMode", mode);
        formData.append("data.ImportMode", mode);
      }
    }
    const response = await apiService.post<Response<ImportResponseType>>(
      "/kPI_NhomTieuChi/ImportExcelVuDonViV2",
      formData
    );
    return response as any;
  }

  public async syncToElastic(searchData?: KPI_NhomTieuChiSearchType | null): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_NhomTieuChi/syncToElastic",
      searchData
    );
    return response as any;
  }

  public async syncToElasticRabbitMQ(searchData?: KPI_NhomTieuChiSearchType | null): Promise<Response> {
    const response = await apiService.post<Response>(
      "/kPI_NhomTieuChi/syncToElasticRabbitMQ",
      searchData
    );
    return response as any;
  }
}

const kPI_NhomTieuChiService = KPI_NhomTieuChiService.instance;
export default kPI_NhomTieuChiService;
