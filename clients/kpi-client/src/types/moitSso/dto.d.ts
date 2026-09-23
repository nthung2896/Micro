import { MoitBusinessPropertyType } from "@/types/moitSso/dto";

export interface MoitBusinessInfoType {
  id: number;
  name?: string;
  englishName?: string;
  shortName?: string;
  taxCode?: string;
  typeId?: number;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  detail?: string;
  cityId?: number;
  cityName?: string;
  fax?: string;
  representerEmail?: string;
  representerMobile?: string;
  representerName?: string;
  submitedDate?: Date;
  approvedDate?: Date;
  registerFileLink?: string;
  numberId?: string;
  properties?: MoitBusinessPropertyType[];
}

export interface MoitBusinessPropertyType {
  name?: string;
  value?: string;
}

export interface MoitResponseType {
  message: number;
  note?: string;
  data?: T;
  isSuccess: boolean;
}

export interface MoitUserInfoType {
  id: number;
  loginName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
}

