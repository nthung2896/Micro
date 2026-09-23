import { EntityType } from "@/types/general";

export interface AppContractExtendType extends EntityType {
  appName: string;
  contractId?: string;
  osCode: string;
  appLink: string;
  logo: string;
}

