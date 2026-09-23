import { EntityType } from "@/types/general";

export interface VuViecPhanAnhType extends EntityType {
  tenNenTang?: string;
  tenUngDung?: string;
  tenThuongNhan?: string;
  maSoDoanhNghiep?: string;
  diaChi?: string;
  dienThoai?: string;
  email?: string;
  maTinh?: string;
  trangThai: number;
  ketLuan: number;
  doanhNghiepId?: string;
  soCongThuongId?: string;
  phanAnhNenTangId: string;
  
  tenTinh?: string;
  tenDoanhNghiep?: string;
  tenSoCongThuong?: string;
  tenNenTangLienKet?: string;
  nenTangLienKetId?: string;
  soThuTu?: number;
  trangThai_txt?: string;
  ketLuan_txt?: string;
}
