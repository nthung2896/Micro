import { EntityType, SearchBase } from "../general";

export interface KPI_QuaTrinhXuLyPhieuDanhGiaType extends EntityType {
  idPhieuDanhGia: string;
  isXuLy: boolean;
  idNguoiXuLy: string;
  idNguoiGui: string;
  trangThai: string;
  ghiChu: string;
  tenNguoiGui?: string;
  chucVuNguoiGui?: string;
  tenNguoiXuLy?: string;
  chucVuNguoiXuLy?: string;
  nguoiGuiUserName?: string;
  nguoiXuLyUserName?: string;
  thoiGianThaoTac?: string;
}

export interface KPI_QuaTrinhXuLyPhieuDanhGiaCreateOrUpdateType {
  id?: string;
  idPhieuDanhGia: string;
  isXuLy: boolean;
  idNguoiXuLy: string;
  idNguoiGui: string;
  trangThai: string;
  ghiChu: string;
}

export interface KPI_QuaTrinhXuLyPhieuDanhGiaSearchType extends SearchBase {
  idPhieuDanhGia?: string;
  isXuLy?: boolean;
  idNguoiXuLy?: string;
  idNguoiGui?: string;
  trangThai?: string;
  ghiChu?: string;
}
