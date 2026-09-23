import { EntityType } from "@/types/general";
import { DuLieuDanhMucType } from "@/types/dM_DuLieuDanhMuc/dto";

export interface DanhMucType {
  id: string;
  groupName?: string;
  groupCode?: string;
  priority?: number;
  listDuLieuDanhMuc?: DuLieuDanhMucType[];
}

export interface DM_NhomDanhMucType extends EntityType {
  groupName: string;
  groupCode: string;
}

export interface DM_NhomDanhMucExportType {
  groupCode?: string;
  groupName?: string;
}

