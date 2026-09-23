
import { SearchBase } from "@/types/general";
export interface ApiPermissionsSaveVMType  {
  roleId?: string;
  userId?: string;
  fullPermission: boolean;
  paths?: string[];
  controllers?: string[];
}

export interface ApiPermissionsSearchType extends SearchBase {
}

