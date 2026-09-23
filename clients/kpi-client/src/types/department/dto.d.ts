import { EntityType } from "@/types/general";
import { DepartmentHierarchyType, DepartmentTreeType, DepartmentUserType, TreeNodeType } from "@/types/department/dto";

export interface DepartmentType extends EntityType {
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
  users: DepartmentUserType[];
}

export interface DepartmentTreeType extends EntityType {
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
  children?: DepartmentTreeType[];
}

export interface DepartmentUserType {
  id: string;
  name: string;
}

export interface DepartmentExportType {
  sTT: number;
  name: string;
  code: string;
  status: string;
  parent: string;
  createdDate: string;
}

export interface TreeNodeType {
  id: string;
  title: string;
  code: string;
  shortName?: string;
  diaDanh?: string;
  parentId?: string;
  priority: number;
  level: number;
  loai: string;
  isActive: boolean;
  capBac?: string;
  maTinh?: string;
  children?: TreeNodeType[];
  soNgayTiepTrenThang?: number;
}

export interface DepartmentHierarchyType {
  id: string;
  title: string;
  code: string;
  shortName?: string;
  diaDanh?: string;
  parentId?: string;
  priority?: number;
  level: number;
  loai: string;
  isActive: boolean;
  maTinh?: string;
  children?: DepartmentHierarchyType[];
}

