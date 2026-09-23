import { EntityType } from "@/types/general";
import { OperationType } from "@/types/operation/dto";

export interface ModuleType extends EntityType {
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
  trangThaiHienThi: string;
  listOperation: Operation[];
  duongDanIcon?: string;
}

export interface ModuleGroupType {
  moduleId: string;
  moduleName: string;
  moduleCode: string;
  operations?: OperationType[];
  selectedCodes?: string[];
}

