import { EntityType, SearchBase } from "@/types/general";

export interface BannerDto extends EntityType {
  name: string;
  image: string;
  link?: string | null;
  position?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface BannerSearch extends SearchBase {
  keyword?: string;
  position?: string;
  isActive?: boolean;
}

export interface BannerRequest {
  id?: string;
  name: string;
  image: string;
  link?: string | null;
  position?: string | null;
  sortOrder: number;
  isActive: boolean;
}
