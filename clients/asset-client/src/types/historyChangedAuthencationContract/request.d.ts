
import { SearchBase } from "@/types/general";
export interface HistoryChangedAuthenticationContractRequestType  {
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

export interface HistoryChangedAuthenticationContractSearchType extends SearchBase {
  userId?: string;
  actionType?: string;
  userName?: string;
  title?: string;
  content?: string;
  authenticationConstractId?: string;
  fromStatus?: number;
  toStatus?: number;
  roleThaoTac?: string;
  note?: string;
  action?: number;
}

