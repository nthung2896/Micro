import { OperationIdRequestType } from "@/types/roleOperation/request";

import { SearchBase } from "@/types/general";
export interface RoleOperationRequestType  {
  id?: string;
  roleId: string;
  listOperationRequest: OperationIdRequestType[];
}

export interface OperationIdRequestType  {
  isAccess: number;
  operationId: string;
}

export interface RoleOperationSearchType extends SearchBase {
  createdId?: string;
  updatedId?: string;
  roleId: number;
  isAccess: number;
  operationId: number;
}

