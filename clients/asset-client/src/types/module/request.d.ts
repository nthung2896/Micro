
import { SearchBase } from "@/types/general";
export interface ModuleRequestType  {
  id?: string;
  createdId?: string;
  updatedId?: string;
  order?: number;
  isShow: boolean;
  allowFilterScope?: boolean;
  isMobile?: boolean;
  code?: string;
  name?: string;
  icon?: string;
  classCss?: string;
  styleCss?: string;
  link?: string;
  fileId?: string;
}

export interface ModuleSearchType extends SearchBase {
  isShow?: boolean;
  code?: string;
  name?: string;
}

