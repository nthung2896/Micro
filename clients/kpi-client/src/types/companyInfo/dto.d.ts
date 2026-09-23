import { EntityType } from "@/types/general";

export interface CompanyInfoType extends EntityType {
  status: number;
  name?: string;
  englishName?: string;
  shortName?: string;
  taxCode?: string;
  address?: string;
  cityId?: string;
  cityName?: string;
  phone?: string;
  fax?: string;
  email?: string;
  representerName?: string;
  representerMobile?: string;
  representerPhone?: string;
  representerEmail?: string;
  representerCCCD?: string;
  detail?: string;
  approveDateOnline?: Date;
  tinhId?: string;
  tinhIdNew?: string;
  xaId?: string;
  quocGiaId?: string;
  typeOrganization?: string;
  isNuocNgoai: boolean;
  isVonDauTuNuocNgoai: boolean;
  dkkd?: string;
  dKKD?: string;
  statusName?: string;
  typeOrganizationName?: string;
}

