import { EntityType } from "@/types/general";

export interface TinhType extends EntityType {
  tenTinh: string;
  sTT?: number;
  maTinh?: string;
}

export interface TinhExportType {
  soH: number;
  cap: number;
  sTT?: number;
  isCucVu?: boolean;
  tenDv: string;
  maTinhMoi?: string;
  maDv: string;
  maTinh: string;
}

export interface TinhImportType {
  soH: number;
  cap: number;
  sTT?: number;
  isCucVu?: boolean;
  tenDv: string;
  maTinhMoi?: string;
  maDv: string;
  maTinh: string;
}

