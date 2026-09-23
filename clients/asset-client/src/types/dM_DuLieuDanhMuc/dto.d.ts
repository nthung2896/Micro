import { EntityType } from "@/types/general";

export interface DM_DuLieuDanhMucType extends EntityType {
  groupId?: string;
  name: string;
  code: string;
  note?: string;
  priority?: number;
  donViId?: string;
  duongDanFile?: string;
  noiDung?: string;
  tenDonVi?: string;
}

export interface DM_DuLieuDanhMucExportType {
  name: string;
  code: string;
  note?: string;
  priority?: number;
}

export interface ChucVuThuTuType {
  thuTu?: number;
  maChucVu: string;
}

export interface DuLieuDanhMucType extends EntityType {
  groupId?: string;
  name: string;
  code: string;
  note?: string;
  priority?: number;
  donViId?: string;
  duongDanFile?: string;
  noiDung?: string;
}

