import { SearchBase } from "@/types/general";

export interface NenTangViPhamRequestType {
  id?: string;
  tenNenTang?: string;
  tenUngDung?: string;
  nguonId?: string;
  loaiViPhamId?: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  isHienThi?: boolean;
  noiDung?: string;
  nenTangLienKetId?: string;
}

export interface NenTangViPhamSearchType extends SearchBase {
  query?: string;
  tenNenTang?: string;
  tenUngDung?: string;
  nguonId?: string;
  loaiViPhamId?: string;
  isHienThi?: boolean;
}
