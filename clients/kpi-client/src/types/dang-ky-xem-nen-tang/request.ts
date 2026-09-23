import { SearchBase } from "@/types/general";

export interface DangKyXemNenTangRequestType {
  id?: string;
  dangKyXemId?: string;
  platformId?: string;
  noiDungXem?: string;
  tuNgay?: Date;
  denNgay?: Date;
}

export interface DangKyXemNenTangSearchType extends SearchBase {
  dangKyXemIdFilter?: string;
}
