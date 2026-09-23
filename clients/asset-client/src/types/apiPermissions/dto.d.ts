import { EntityType } from "@/types/general";
import { ApiPermissionActionType } from "@/types/apiPermissions/dto";

export interface ApiPermissionGroupDataType {
  name?: string;
  path?: string;
  checked: boolean;
  actions?: ApiPermissionActionType[];
}

export interface ApiPermissionActionType {
  name?: string;
  path?: string;
  checked: boolean;
}

export interface ApiPermissionsType extends EntityType {
  userId?: string;
  roleId?: string;
  path?: string;
}

