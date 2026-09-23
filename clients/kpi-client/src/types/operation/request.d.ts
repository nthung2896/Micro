
import { SearchBase } from "@/types/general";
export interface OperationRequestType  {
  id?: string;
  moduleId: string;
  createdId?: string;
  updatedId?: string;
  name?: string;
  url?: string;
  code?: string;
  css?: string;
  icon?: string;
  order: number;
  isShow: boolean;
}

export interface OperationSearchType extends SearchBase {
  moduleId?: string;
  name?: string;
  url?: string;
  code?: string;
  isShow?: boolean;
}

