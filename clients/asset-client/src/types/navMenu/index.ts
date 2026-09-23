import { EntityType, SearchBase } from "@/types/general";

export interface NavMenuDto extends EntityType {
  label: string;
  href: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  parentLabel?: string | null;
  children: NavMenuDto[];
  menuType?: string;
}

export interface NavMenuSearch extends SearchBase {
  query?: string;
  isActive?: boolean;
  parentId?: string;
  menuType?: string;
}

export interface NavMenuRequest {
  id?: string;
  label: string;
  href: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  menuType?: string;
}
