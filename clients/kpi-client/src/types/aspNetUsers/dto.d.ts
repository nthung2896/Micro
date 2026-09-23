import { AppUserType } from "@/types/appUser/dto";

export interface AnhChuKySoType {
  userId?: string;
  taiLieuDinhKemId?: string;
  tenFile?: string;
  duongDanFile?: string;
}

export interface AspNetUsersType {
  maCanBo?: string;
  name?: string;
  gender: number;
  picture?: string;
  type?: string;
  donViId?: string;
  ngaySinh?: Date;
  diaChi?: string;
  isSSO?: boolean;
  canBoId?: string;
  groupRole?: string;
  cCCD?: string;
  createdDate: Date;
  createdBy?: string;
  createdId?: string;
  updatedDate: Date;
  updatedId?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedDate?: Date;
  deletedId?: string;
  id?: string;
  userId?: string;
  tenDonVi_txt: string;
  gioiTinh_txt: string;
  vaiTro_response: string;
  vaiTro_txt_response: string[];
}

export interface UserDto1Type {
  id: string;
  userName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  ngaySinh?: Date;
  gioiTinh_txt?: string;
  diaChi?: string;
  type?: string;
  lockoutEnabled: boolean;
  donViId?: string;
  gender?: string;
  picture?: string;
  vaiTro?: string[];
  listPhongBan?: string[];
  tenDonVi_txt?: string;
  vaiTro_response?: string;
  vaiTro_txt_response?: string[];
  groupRole_txt?: string;
  groupRole_response?: string[];
  departmentId?: string;
  department_txt?: string;
  nhomNguoi?: string[];
  nhomNguoi_txt?: string[];
}

export interface DepartmentAndKhoType {
  departmentId: string;
  khoiCode: string;
  id?: string;
  userId: string;
  roleCode?: string[];
  idGroupRoles?: string[];
}

export interface ImportType {
  listTrue: AppUserType[];
  listFalse: AppUserType[];
}

