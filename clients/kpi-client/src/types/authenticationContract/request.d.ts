import { AppContractExtendRequestType } from "@/types/appContractExtend/request";
import { AuthConstractCategoryRequestType } from "@/types/authConstractCategory/request";

import { SearchBase } from "@/types/general";
export interface AuthenticationContractRequestType {
  id?: string;
  representerJob: string;
  representerNameOnline: string;
  representerJobOnline: string;
  representerCCCDOnline: string;
  representerDiaChiOnline: string;
  representerMobileOnline: string;
  representerEmailOnline: string;
  name: string;
  domain: string;
  domainAdd: string;
  chuSoHuu: string;
  logo: string;
  iSPId: string;
  iSPidKhac?: string;
  linhVucCungCapKhac?: string;
  ngonNgu: string;
  staffNumber: number;
  lyDoDeNghiCapNhat?: string;
  note?: string;
  chuyenVienXuLyId?: string;
  authConstractCategories: AuthConstractCategoryRequestType[];
  appContractRequests: AppContractExtendRequestType[];
  listFileIds: string[];
}

export interface AuthenticationContractSearchType extends SearchBase {
  representerJob?: string;
  companyTaxCode?: string;
  organizationId?: string;
  typeOrganization?: string;
  representerNameOnline?: string;
  representerJobOnline?: string;
  representerCCCDOnline?: string;
  representerDiaChiOnline?: string;
  representerMobileOnline?: string;
  representerEmailOnline?: string;
  name?: string;
  domain?: string;
  domainAdd?: string;
  chuSoHuu?: string;
  logo?: string;
  iSPId?: string;
  iSPidKhac?: string;
  linhVucCungCapKhac?: string;
  ngonNgu?: string;
  staffNumber?: number;
  status?: number;
  lyDoDeNghiCapNhat?: string;
  note?: string;
  chuyenVienXuLyId?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
}

export interface AuthenticationContractUpdateRequestType {
  note?: string;
}
export interface DuyetAuthenticationContractRequestType {
  listIdHoSo?: string[];
  lyDo: string;
  trangThaiDuyet: number;
  userId?: string;
  thoiGianCapPhep?: string;
}

