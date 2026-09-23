import { SearchBase } from "@/types/general";

export interface PhanAnhNenTangRequestType {
  id?: string;
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
  trangThai?: number;
  tepDinhKem?: string;
  isCVTao?: boolean;
  lyDoTuChoi?: string;
  captchaId?: string;
  captchaInput?: string;
}

export interface PhanAnhNenTangSearchType extends SearchBase {
  query?: string;
  hoTen?: string;
  email?: string;
  soDienThoai?: string;
  tenNenTang?: string;
  maTinh?: string;
  trangThai?: number;
  loaiPhanAnhId?: string;
  vuViecId?: string;
}
