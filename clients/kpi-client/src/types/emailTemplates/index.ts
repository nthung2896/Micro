import { EntityType, SearchBase } from "@/types/general";

export interface EmailTemplatesDto extends EntityType {
  code?: string | null;
  subject?: string | null;
  body?: string | null;
  bodyType?: string | null;
  variables?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export interface EmailTemplatesSearch extends SearchBase {
  code?: string;
  subject?: string;
  bodyType?: string;
  isActive?: boolean;
}

export interface EmailTemplatesRequest {
  id?: string;
  code: string;
  subject: string;
  body: string;
  bodyType?: string | null;
  variables?: string | null;
  description?: string | null;
  isActive?: boolean;
}
