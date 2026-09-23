export interface EntityType {
  id: string;
  createdDate?: Date;
  createdBy?: string;
  updatedDate?: Date;
  updatedBy?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  status?: boolean;
  message?: string;
  errors?: string[] | null;
}

export interface Dictionary<T = any> {
  [key: string]: T;
}

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
  selected?: boolean;
}

export interface PagedList<T = any> {
  items: T[];
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  totalPage?: number;
}

export interface DropdownOptionTree {
    value: string;
    title: string;
    disabled?: boolean;
    children: DropdownOptionTree[];
}

//#region cũ không xài nữa
export interface ResponsePageList<T = any> {
  items: T;
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number;
  totalPage?: number;
}

export interface ResponsePageInfo {
  pageIndex?: number;
  pageSize?: number;
  totalCount?: number | 0;
  totalPage?: number | 0;
}

export interface SearchBase {
  pageIndex?: number | 1;
  pageSize?: number | 20;
}

export interface DataImport {
  idFile: string;
  collection: FieldAndSTTType[];
}
export interface FieldAndSTTType {
  order: number;
  columnName: string;
  displayName: string;
}

export interface ConfigImport {
  order: number;
  columnName?: string;
  displayName?: string;
}

export interface Response<T = any> {
  data: T;
  status?: boolean;
  message?: string;
  errors?: string[] | null;
}

export interface DataToSend {
  [key: string]: any;
}
