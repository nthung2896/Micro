import { SearchBase } from "@/types/general";

export interface VuViecPhanAnhRequestType {
  id?: string;
  tenNenTang?: string;
  tenUngDung?: string;
  tenThuongNhan?: string;
  maSoDoanhNghiep?: string;
  diaChi?: string;
  dienThoai?: string;
  email?: string;
  maTinh?: string;
  trangThai?: number;
  ketLuan?: number;
  doanhNghiepId?: string;
  soCongThuongId?: string;
  phanAnhNenTangId?: string;
  nenTangLienKetId?: string;
}

export interface VuViecPhanAnhSearchType extends SearchBase {
  query?: string;
  tenNenTang?: string;
  tenUngDung?: string;
  tenThuongNhan?: string;
  maSoDoanhNghiep?: string;
  maTinh?: string;
  trangThai?: number;
  ketLuan?: number;
  nenTangLienKetId?: string;
}
