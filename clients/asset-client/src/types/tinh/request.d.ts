
import { SearchBase } from "@/types/general";
export interface TinhRequestType  {
  id?: string;
  sTT?: number;
  tenTinh: string;
  maTinh: string;
}

export interface TinhSearchType extends SearchBase {
  sTT?: number;
  tenTinh?: string;
  maTinh?: string;
}

