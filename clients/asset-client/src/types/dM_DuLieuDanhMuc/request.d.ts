import { ParentQueryType } from "@/types/dM_DuLieuDanhMuc/request";

import { SearchBase } from "@/types/general";
export interface DM_DuLieuDanhMucRequestType  {
  id?: string;
  groupId?: string;
  name?: string;
  code?: string;
  note?: string;
  priority?: number;
  donViId?: string;
  fileId?: string;
  noiDung?: string;
}

export interface DM_DuLieuDanhMucSearchType extends SearchBase {
  groupId?: string;
  name?: string;
  code?: string;
  note?: string;
  priority?: number;
}

export interface SelectDM_DuLieuLazyRequestType  {
  groupCode: string;
  pageIndex: number;
  pageSize: number;
  filterName?: string;
  selected?: string;
  parentQuery?: ParentQueryType[];
}

export interface ParentQueryType  {
  key?: string;
  value?: string;
}

