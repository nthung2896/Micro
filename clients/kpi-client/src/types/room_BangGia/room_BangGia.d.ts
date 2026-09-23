import { EntityType, SearchBase } from "../general";

export interface Room_BangGiaType extends EntityType {
  loaiTin: string;
  thuocTinh?: string;
  maMau?: string;
  giaTin?: number;
  isTuDongDuyet?: boolean;
  isDuyTriThem10Ngay?: boolean;
  isHienThiNutGoi: boolean;
}

export interface Room_BangGiaCreateOrUpdateType {
  id?: string;
  loaiTin: string;
  thuocTinh?: string;
  maMau?: string;
  giaTin?: number;
  isTuDongDuyet?: boolean;
  isDuyTriThem10Ngay?: boolean;
  isHienThiNutGoi?: boolean;
}

export interface Room_BangGiaSearchType extends SearchBase {
  loaiTin?: string;
  thuocTinh?: string;
  isHienThiNutGoi?: boolean;
  isTuDongDuyet?: boolean;
  isDuyTriThem10Ngay?: boolean;
}
