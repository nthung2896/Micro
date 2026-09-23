export interface KPI_TieuChiChung_DiemSo_CapTrenByPhieuItem {
  idTieuChiChungDiemSo: string;
  idTieuChiChung: string;
  idPhieuDanhGia?: string | null;
  idLyLich?: string | null;
  idDotDanhGia?: string | null;
  diemTuCham?: number | null;
  diemCapTren?: number | null;
  diemToiDa?: number | null;
  ghiChu?: string | null;
  diemTheoVaiTro?: Record<string, number | null>;
}

export interface KPI_TieuChiChung_DiemSo_CapTrenByPhieuResponse {
  items: KPI_TieuChiChung_DiemSo_CapTrenByPhieuItem[];
  vaiTroDanhGia?: string | null;
  canEdit: boolean;
  tongDiemCapTren: number;
  isComplete: boolean;
  danhSachVaiTroDaDanhGia?: string[];
  tongDiemTheoVaiTro?: Record<string, number>;
}

export interface KPI_TieuChiChung_DiemSo_CapTrenSaveBatchItem {
  idTieuChiChungDiemSo: string;
  diem?: number | null;
  ghiChu?: string | null;
}

export interface KPI_TieuChiChung_DiemSo_CapTrenSaveBatchRequest {
  idPhieuDanhGia: string;
  isHoanTat: boolean;
  items: KPI_TieuChiChung_DiemSo_CapTrenSaveBatchItem[];
}
