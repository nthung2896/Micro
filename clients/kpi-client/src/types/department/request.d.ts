import { DepartmentVMType } from "@/types/department/request";
import { RoleVMType } from "@/types/role/request";

import { SearchBase } from "@/types/general";
export interface DepartmentRequestType  {
  id?: string;
  createdId?: string;
  updatedId?: string;
  parentId?: number;
  priority?: number;
  name?: string;
  code?: string;
  loai?: string;
  level: number;
  isActive: boolean;
  idcha: string;
  idchinhno: string;
  diaDanh?: string;
  maTinh?: string;
  address?: string;
  hotline?: string;
  email?: string;
}

export interface DepartmentSaveRequestType  {
  id?: string;
  name: string;
  shortName?: string;
  code: string;
  parentId?: string;
  priority?: number;
  level: number;
  loai: string;
  isActive: boolean;
  diaDanh?: string;
  maTinh?: string;
  address?: string;
  hotline?: string;
  email?: string;
}

export interface DepartmentSearchType extends SearchBase {
  createdId?: string;
  updatedId?: string;
  parentId?: number;
  priority?: number;
  name?: string;
  code?: string;
  loai?: string;
  level?: number;
  isActive?: boolean;
}

export interface DepartmentVMType  {
  id: string;
  name?: string;
  code?: string;
  parentId?: string;
  priority?: number;
  level: number;
  isActive: boolean;
  departmentChilds: DepartmentVMType[];
  roles: RoleVMType[];
}

