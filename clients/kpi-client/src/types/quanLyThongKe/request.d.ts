export interface ThongKeSoLuongTheoDiaPhuongSearchType {
  departmentIds?: string[];
  year?: number;
}

export interface ThongKeSoLuongTheoDiaPhuongDetailSearchType {
  departmentId: string;
  departmentIds?: string[];
  platformKey: string;
  statusBucket?: string;
  metricKey?: string;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  pageIndex: number;
  pageSize: number;
}

export interface ThongKeXuLyHoSoTheoDiaPhuongSearchType {
  dateFrom?: string;
  dateTo?: string;
  departmentIds?: string[];
}

export interface ThongKeTheoThoiGianSearchType {
  dateFrom: string;
  dateTo: string;
}

export interface ThongKePhanAnhVaViPhamSearchType {
  departmentIds?: string[];
  year?: number;
}

export interface ThongKePhanAnhVaViPhamDetailSearchType {
  departmentId: string;
  departmentIds?: string[];
  metricKey: string;
  year?: number;
  pageIndex: number;
  pageSize: number;
}
