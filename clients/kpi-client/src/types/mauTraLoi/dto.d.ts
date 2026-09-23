import { EntityType } from "../general";

export interface MauTraLoiType extends EntityType {
  name: string;
  content: string;
  type: string;
  nhomTaiLieu: string;
  typeName?: string;
  nhomTaiLieuName?: string;
}
