import { EntityType, SearchBase } from "../general";

export interface KPI_NhomTieuChiType extends EntityType {
  tenNhomTieuChi?: string;
  congViecChiTiet?: string;
  sanPhamDauRa?: string;
  phanNhom?: string;
  khungDiemToiDa?: number;
  diem?: number;
  heSoQuyDoi?: number;
  ghiChu?: number;
  idDonVi?: string;
  parentID?: string;
  idBoTieuChiDonVi?: string;
  stt?: number;
}

export interface KPI_NhomTieuChiCreateOrUpdateType {
  id?: string;
  tenNhomTieuChi?: string;
  congViecChiTiet?: string;
  sanPhamDauRa?: string;
  phanNhom?: string;
  khungDiemToiDa?: number;
  diem?: number;
  heSoQuyDoi?: number;
  ghiChu?: number;
  idDonVi?: string;
  parentID?: string;
  idBoTieuChiDonVi?: string;
}

export interface KPI_NhomTieuChiSearchType extends SearchBase {
  keyword?: string;
  tenNhomTieuChi?: string;
  congViecChiTiet?: string;
  sanPhamDauRa?: string;
  phanNhom?: string;
  idDonVi?: string;
  level?: number;
  isElastic?: boolean;
  idBoTieuChiDonVi?: string;
  parentID?: string;
}

export interface ImportResultFalseType {
  row: number;
  reason: string;
  tenNhom?: string;
  congViec?: string;
}

export interface ImportResponseType {
  listTrue: KPI_NhomTieuChiType[];
  lstFalse: ImportResultFalseType[];
  totalSuccess: number;
  totalFailed: number;
}

export interface KPI_BoTieuChiDonViImportVMType {
  IdDonVi?: string;
  IdDot?: string;
  ApDungTuNgay?: string;
  ApDungToiNgay?: string;
  TenBoTieuChiDonVi?: string;
  RowStart?: number;
  RowName?: number;
  SoQuyetDinh?: string;
  NgayQuyetDinh?: string;
  RowInfo?: number;
  TotalColumns?: number;
}

