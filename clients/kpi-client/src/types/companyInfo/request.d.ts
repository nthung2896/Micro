
import { SearchBase } from "@/types/general";
export interface CompanyInfoSearchType extends SearchBase {
  keyword?: string;
  taxCode?: string;
  name?: string;
  status?: number;
  typeOrganization?: string;
  tinhId?: string;
  tinhIdNew?: string;
  isNuocNgoai?: boolean;
}

export interface CompanyInfoUpdateStatusRequestType  {
  id: string;
  status: number;
}

