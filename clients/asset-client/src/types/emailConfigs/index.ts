import { EntityType, SearchBase } from "@/types/general";

export interface EmailConfigsDto extends EntityType {
  from?: string | null;
  host?: string | null;
  alias?: string | null;
  port?: string | null;
  userName?: string | null;
  password?: string | null;
  enableSsl?: boolean | null;
  allowSendMail?: boolean | null;
  dailyLimit?: number | null;
  sentToday?: number | null;
  quotaResetDate?: string | null;
  lastUsedAt?: string | null;
  consecutiveFailures?: number | null;
  lastFailedAt?: string | null;
  lastFailReason?: string | null;
  passwordMasked?: string | null;
}

export interface EmailConfigsSearch extends SearchBase {
  from?: string;
  host?: string;
  userName?: string;
  enableSsl?: boolean;
  allowSendMail?: boolean;
}

export interface EmailConfigsRequest {
  id?: string;
  from?: string;
  host?: string;
  alias?: string;
  port?: string;
  userName?: string;
  password?: string;
  enableSsl?: boolean;
  allowSendMail?: boolean;
  dailyLimit?: number;
}
