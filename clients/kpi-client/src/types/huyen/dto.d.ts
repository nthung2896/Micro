import { EntityType } from "@/types/general";

export interface HuyenType extends EntityType {
  tenHuyen: string;
  ma: string;
  maTinh: string;
  loaiHuyen: number;
  tenTinh: string;
}

export interface HuyenExportType {
  loaiHuyen: number;
  tenHuyen: string;
  ma: string;
  maTinh: string;
  maTinhMoi?: string;
}

export interface HuyenImportType {
  loaiHuyen: number;
  tenHuyen: string;
  ma: string;
  maTinh: string;
  maTinhMoi?: string;
}

export interface HuyenSearchType {
  loaiHuyenFilter: number;
  tenHuyenFilter: string;
  maFilter: string;
  maTinhFilter: string;
  maTinhMoiFilter?: string;
}

