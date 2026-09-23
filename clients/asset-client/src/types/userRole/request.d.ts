import { PermissionRowRequestType } from "@/types/userRole/request";

import { SearchBase } from "@/types/general";
export interface UserRoleRequestType  {
  id?: string;
  userId: string;
  roleCode?: string[];
  deparmentId?: string;
  idGroupRoles?: string[];
}

export interface UserRoleRequest_GanNguoiType  {
  userId: string;
  listDataRole: string[];
}

export interface PermissionRowRequestType  {
  khoiCode: string;
  departmentId: string;
  roleCodes: string[];
}

export interface UserRoleBulkRequestType  {
  userId: string;
  permissions: PermissionRowRequestType[];
}

export interface UserRoleSearchType extends SearchBase {
  userId?: string;
  roleId?: string;
  createdId?: string;
  updatedId?: string;
}

