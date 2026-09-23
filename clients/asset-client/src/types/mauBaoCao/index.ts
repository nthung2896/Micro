import { EntityType, SearchBase } from "@/types/general";

export interface MauBaoCaoDto extends EntityType {
  maMauBaoCao: string;
  tenMauBaoCao: string;
  fileDinhKem?: string | null;
  appManageTypeId?: number | null;
  loaiNenTang?: string | null;
  loaiNenTangName?: string | null;
  loaiHinhNenTang?: string | null;
  loaiHinhNenTangName?: string | null;
  keys?: string | null;
  htmlContent?: string | null;
  trangThaiNenTang?: string | null; // Danh sách trạng thái nền tảng, VD: "5,7,8"
  kyBaoCao?: string | null; // THANG, QUY, NAM
  hanNopThang?: number;
  hanNopNgay?: number;
  phanLoai?: string | null; // NEN_TANG, CHUNG_THUC
}

export interface MauBaoCaoSearch extends SearchBase {
  keyword?: string;
  loaiNenTang?: number;
  loaiHinhNenTang?: string;
}

export interface MauBaoCaoCreateRequest {
  id?: string;
  maMauBaoCao: string;
  tenMauBaoCao: string;
  fileDinhKem?: string | null;
  loaiNenTang?: number[];
  loaiHinhNenTang?: string | null;
  keys?: string | null;
  trangThaiNenTang?: string | null;
  kyBaoCao?: string | null;
  hanNopThang?: number;
  hanNopNgay?: number;
  phanLoai?: string | null;
}

export interface MauBaoCaoChiTietDto extends EntityType {
  mauBaoCaoId: string;
  keyName: string;
  displayName: string;
  inputType: string; // Input, TextArea, Dropdown, Checkbox, Radio, File, Number
  isRequired: boolean;
  options?: string | null;
  layout?: string; // Horizontal, Vertical — cho Checkbox, Radio
  minValue?: number | null;
  maxValue?: number | null;
}

export interface SaveMauBaoCaoDataRequest {
  mauBaoCaoId: string;
  companyId?: string | null;
  platformId?: string | null;
  contractId?: string | null;
  thangBaoCao: number;
  namBaoCao: number;
  kyBaoCao?: string | null;
  status?: string | null; // DRAFT, SUBMITTED
  values: Record<string, string>;
}

export interface MauBaoCaoDataDto {
  id?: string;
  mauBaoCaoId: string;
  companyId?: string | null;
  platformId?: string | null;
  thangBaoCao: number;
  namBaoCao: number;
  kyBaoCao?: string | null;
  status: string; // DRAFT, SUBMITTED
  isViewed: boolean;
  values: Record<string, string>;
  createdDate?: string;
}

export interface MauBaoCaoTrackingSearch extends SearchBase {
  thangBaoCao: number;
  namBaoCao: number;
  keyword?: string;
  loaiNenTang?: number;
  mauBaoCaoId?: string;
  trangThaiNenTang?: string; // Danh sách trạng thái nền tảng cần lấy, VD: "5,7,8"
  companyTaxCodes?: string[]; // Lọc theo danh sách mã số thuế
  kyBaoCao?: string; // THANG, QUY, NAM
  phanLoai?: string; // NEN_TANG, CHUNG_THUC
}

export interface MauBaoCaoTrackingDto {
  mauBaoCaoId?: string | null;
  platformId: string;
  platformName: string;
  domain?: string | null;
  appManageTypeId?: number;
  loaiNenTangName?: string | null;
  companyId?: string | null;
  companyName: string;
  companyTaxCode: string;
  companyEmail?: string | null;
  companyPhone?: string | null;
  isSubmitted: boolean;
  status?: string | null; // DRAFT, SUBMITTED
  submittedDate?: string | null;
  mongoDataId?: string | null;
}
