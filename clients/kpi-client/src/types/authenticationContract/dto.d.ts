import { EntityType } from "@/types/general";
import { AppContractExtendType } from "@/types/appContractExtend/dto";
import { AuthConstractCategoryType } from "@/types/authConstractCategory/dto";

export interface AuthenticationContractType extends EntityType {
  representerJob: string;
  companyTaxCode: string;
  organizationId: string;
  typeOrganization: string;
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
  status: number;
  lyDoDeNghiCapNhat?: string;
  note?: string;
  chuyenVienXuLyId?: string;
  listCategories: AuthConstractCategoryType[];
  appExtends: AppContractExtendType[];
  dauMoiXuLi?:string;
  dvcMaHoSo?: string;
  dvcIdHoSo?: string;
  dvcSyncStatus?: number;
  dvcSyncDate?: string;
  dvcRetryCount?: number;
  dvcErrorMessage?: string;
  submitDate?: string;
}

export interface AuthenticationContractWorkflowRuleType {
  currentStatus: number;
  action: number;
  role: string;
  nextStatus: number;
  logTitleTemplate: string;
  logContentTemplate: string;
}

export interface CreateDataType {
  name?: string;
  companyTaxCode?: string;
  address?: string;
  email?: string;
  representerName?: string;
  representerCCCD?: string;
  representerDiaChi?: string;
  representerMobile?: string;
  representerEmail?: string;
}

