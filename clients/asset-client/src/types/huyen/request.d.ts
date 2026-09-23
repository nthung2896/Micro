
import { SearchBase } from "@/types/general";
export interface HuyenRequestType  {
  id?: string;
  loaiHuyen: number;
  tenHuyen: string;
  ma: string;
  maTinh: string;
  maTinhMoi?: string;
}

export interface HuyenSearchType extends SearchBase {
  loaiHuyen?: number;
  tenHuyen?: string;
  ma?: string;
  maTinh?: string;
  maTinhMoi?: string;
  tenTinh?: string;
}

