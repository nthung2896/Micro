import { EntityType } from "@/types/general";

export interface PhanAnhNenTangType extends EntityType {
  hoTen?: string;
  email?: string;
  soDienThoai?: string;
  ngaySinh?: string;
  soCCCD?: string;
  ngayCap?: string;
  noiCap?: string;
  diaChiThuongTru?: string;
  loaiPhanAnhId?: string;
  tenNenTang?: string;
  diaChiNenTang?: string;
  tenUngDung?: string;
  lienKetTaiUngDung?: string;
  maTinh?: string;
  noiDungPhanAnh?: string;
  trangThai: number;
  tenTinh?: string;
  tenLoaiPhanAnh?: string;
  tepDinhKem?: string;
  trangThai_txt?: string;
  isCVTao?: boolean;
  lyDoTuChoi?: string;
  hasVuViec?: boolean;
  vuViecId?: string;
  tenThuongNhan?: string;
  soThuTu?: number;
  ketLuan?: number;
  ketLuan_txt?: string;
}
