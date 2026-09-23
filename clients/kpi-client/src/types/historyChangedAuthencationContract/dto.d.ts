import { EntityType } from "@/types/general";

export interface HistoryChangedAuthencationContractType extends EntityType {
  userId: string;
  actionType: string;
  userName: string;
  title?: string;
  content?: string;
  authenticationConstractId: string;
  fromStatus?: number;
  toStatus?: number;
  roleThaoTac?: string;
  note?: string;
  action?: number;
}

