import { EntityType, SearchBase } from "../general";

export interface AppConfigurationType extends EntityType {
  tenApp: string;
  tenDoanhNghiep: string;
  diaChi: string;
  soDienThoai: string;
  email: string;
  logoLink?: string;
  loginBackgroundLink?: string;
  loginModalImage?: string;
  primaryColor: string;
  isActive?: boolean;
}

export interface AppConfigurationCreateOrUpdateType {
  id?: string;
  tenApp: string;
  tenDoanhNghiep: string;
  diaChi: string;
  soDienThoai: string;
  email: string;
  logoLink?: string;
  loginBackgroundLink?: string;
  loginModalImage?: string;
  primaryColor: string;
  isActive?: boolean;
  logoFileId?: string;
  bgFileId?: string;
  loginModalImageFileId?: string;
}

export interface AppConfigurationSearchType extends SearchBase {
  tenApp?: string;
  tenDoanhNghiep?: string;
  diaChi?: string;
  soDienThoai?: string;
  email?: string;
  logoLink?: string;
  loginBackgroundLink?: string;
  loginModalImage?: string;
  primaryColor?: string;
  isActive?: boolean;
}
