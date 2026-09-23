import { AppUserType, UserInfoSSOType } from "@/types/appUser/dto";
import { MenuDataType } from "@/types/operation/dto";

export interface AppUserType {

  id?: string;
  maCanBo?: string;
  name?: string;
  email?: string;
  gender: number;
  picture?: string;
  listRole: string[];
  donViId?: string;
  isSSO?: boolean;
  isHasRole?: boolean;
  anhDaiDien?: string;
  tenDonVi_txt?: string;
  idJoin: string;
  type?: string;
  userName?: string;
  diaChi?: string;
  tinh?: string;
  huyen?: string;
  cCCD?: string;
  phoneNumber?: string;
  ngaySinh?: Date;
  gioiTinh_txt?: string;
  vaiTro_response?: string;
  vaiTro_txt_response?: string[];
  groupRole_txt?: string;
  department_txt?: string;
  lockoutEnabled: boolean;
  departmentId: string;
  phongBanId?: string;
  groupRole_response: string[];
  listPhongBan: string[];
  vaiTro: string[];
  menuData?: MenuDataType[];
  nhomNguoi_txt?:string[];
  isKySo?: boolean;
  tenChucVu?: string;
  chucVuCode?: string;
  idLyLich?: string;
  isCT?: boolean;
  isPCT?: boolean;
  isTP?: boolean;
  isPTP?: boolean;
}

export interface LoginResponseType {
  user?: AppUserType;
  token?: string;
  refreshToken?: string;
  expire?: Date;
  isSSO?: boolean;
}

export interface SSOResponseType {
  data?: string;
  error_Code: number;
  message?: string;
}

export interface UserSSOType {
  soDinhDanh?: string;
  hoVaTen?: string;
  ngayThangNamSinh?: string;
  loaiTaiKhoan?: string;
}

export interface DataObjectType {
  data: UserInfoSSOType;
  message: string;
  statusCode: number;
}

export interface UserInfoSSOType {
  userID: number;
  userName: string;
  hoTen: string;
  donViID: string;
  tenDonVi: string;
  tenPhongBan: string;
  tenChucVu: string;
  donViKhac: string[];
}

