import { EntityType } from "@/types/general";

export interface UserPermissionType {
  khoiCode: string;
  departmentId: string;
  roleCodes: string[];
}

export interface UserRoleType extends EntityType {
  userId: string;
  roleId: string;
  departmentId: string;
  khoiCode?: string;
}

export interface UserRoleVMType {
  userId: string;
  departments: DepartmentVM[];
}

