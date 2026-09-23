import { AuthenticationContractRequestType } from "@/types/authenticationContract/request";

export type PlatformType = "website" | "app" | "both";

export type ContractFormValues = Omit<
  AuthenticationContractRequestType,
  "authConstractCategories"
> & {
  platformType?: PlatformType;
  linhVucCungCapDichVuCodes?: string[];
  contactName?: string;
  contactJob?: string;
  contactCCCD?: string;
  contactAddress?: string;
  contactMobile?: string;
  contactEmail?: string;
};
