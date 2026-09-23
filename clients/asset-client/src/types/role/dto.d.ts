import { EntityType } from "@/types/general";

export interface RoleType extends EntityType {
  name: string;
  code: string;
  type?: string;
  isActive: boolean;
  departmentId?: string;
  isGanNguoi: boolean;
  type_txt: string;
}

