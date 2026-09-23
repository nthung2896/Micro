
import { SearchBase } from "@/types/general";
export interface DM_NhomDanhMucRequestType  {
  id?: string;
  groupName?: string;
  groupCode?: string;
}

export interface DM_NhomDanhMucSearchType extends SearchBase {
  createdId?: string;
  updatedId?: string;
  groupName?: string;
  groupCode?: string;
}

