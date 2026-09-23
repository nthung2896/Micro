import { EntityType, SearchBase } from "../general";

export interface XaType extends EntityType {
  isXaMoi?: boolean;
	maXa?: string;
	tenXa?: string;
	maHuyen?: string;
	loai?: string;
	maTinh?: string;
}

export interface XaCreateOrUpdateType {
  id?: string;
  
}

export interface XaSearchType extends SearchBase {
  maTinh?: string;
  maHuyen?: string;
  tenXa?: string;
  maXa?: string;
}
