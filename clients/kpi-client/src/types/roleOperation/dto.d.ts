import { EntityType } from "@/types/general";

export interface RoleOperationType extends EntityType {
  roleId: string;
  operationId: string;
  isAccess: number;
}

export interface RoleOperationViewModelType {
  roleName?: string;
  roleId: string;
  isAccess: boolean;
  operationId: string;
  operationName?: string;
}

