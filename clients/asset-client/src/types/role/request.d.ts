
import { SearchBase } from "@/types/general";
export interface RoleOperationMultiRequestType  {
  id: string;
  listOperation: string[];
}

export interface RoleRequestType  {
  id?: string;
  name?: string;
  code?: string;
  type?: string;
}

export interface RoleSearchType extends SearchBase {
  createdId?: string;
  updatedId?: string;
  name?: string;
  code?: string;
  departmentId?: string;
}

export interface RoleVMType  {
  id: string;
  name: string;
  code: string;
  isChecked: boolean;
}

