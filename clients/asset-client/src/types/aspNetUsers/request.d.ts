
import { SearchBase } from "@/types/general";
export interface AnhChuKySoRequestType  {
  userId?: string;
  taiLieuDinhKemId?: string;
  tenFile?: string;
  duongDanFile?: string;
}

export interface AspNetUsersRequestType  {
  id?: string;
  maCanBo?: string;
  lockoutEnd?: string;
  accessFailedCount: number;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnabled: boolean;
  name?: string;
  gender?: string;
  picture?: string;
  type?: string;
  permissions?: string;
  userName?: string;
  phoneNumber?: string;
  normalizedUserName?: string;
  email?: string;
  normalizedEmail?: string;
  passwordHash?: string;
  securityStamp?: string;
  concurrencyStamp?: string;
  donViId?: string;
  ngaySinh?: Date;
  diaChi?: string;
  hoiDong?: string;
  matKhau?: string;
  loaiTaiKhoan?: string;
  vaiTro?: string[];
}

export interface AspNetUsersSearchType extends SearchBase {
  name?: string;
  type?: string;
  userName?: string;
  email?: string;
  diaChi?: string;
  donViId?: string;
  parentDonViId?: string;
  departmentId?: string;
  vaiTro?: string[];
  keyword?: string;
  phoneNumber?: string;
  permissionCode?: string;
}

