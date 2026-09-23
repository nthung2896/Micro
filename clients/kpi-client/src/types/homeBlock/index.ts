import { EntityType, SearchBase } from "@/types/general";

export interface HomeBlockDto extends EntityType {
  code?: string | null;
  title?: string | null;
  body?: string | null;
  bodyType?: string | null;
  variables?: string | null;
  position?: string | null;
  sortOrder?: number;
  dataSource?: string | null;
  description?: string | null;
  isActive?: boolean;
}

export interface HomeBlockSearch extends SearchBase {
  code?: string;
  title?: string;
  position?: string;
  isActive?: boolean;
}

export interface HomeBlockRequest {
  id?: string;
  code: string;
  title: string;
  body: string;
  bodyType?: string | null;
  variables?: string | null;
  position?: string | null;
  sortOrder?: number;
  dataSource?: string | null;
  description?: string | null;
  isActive?: boolean;
}
