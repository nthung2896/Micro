import { EntityType } from "@/types/general";
import { MenuDataType, OperationType } from "@/types/operation/dto";

export interface MenuDataType {
  id: string;
  code?: string;
  name?: string;
  order: number;
  isShow: boolean;
  icon?: string;
  classCss?: string;
  styleCss?: string;
  allowFilterScope?: boolean;
  isMobile?: boolean;
  isAccess?: boolean;
  moduleId: string;
  url?: string;
  listMenu?: MenuDataType[];
}

export interface OperationType extends EntityType {
  moduleId: string;
  name: string;
  url: string;
  code: string;
  css?: string;
  isShow: boolean;
  order: number;
  icon?: string;
  trangThaiHienThi: string;
  isAccess: boolean;
}

export interface ModuleMenuDTOType extends EntityType {
  code: string;
  name: string;
  order: number;
  isShow: boolean;
  icon?: string;
  classCss?: string;
  styleCss?: string;
  link?: string;
  allowFilterScope?: boolean;
  isMobile?: boolean;
  listOperation?: OperationType[];
}

