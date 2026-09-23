import { EntityType, SearchBase } from "../general";

export interface KPI_TieuChiChungType extends EntityType {
  ten: string;
	parentId: string;
	tenParent?: string;
	myProperty: number;
	priority?: number;
	idBoTieuChiChung?: string;
  tenBoTieuChiChung?: string;
}

export interface KPI_TieuChiChungCreateOrUpdateType {
  id?: string;
  ten: string;
	parentId: string;
	myProperty: number;
	priority?: number;
	idBoTieuChiChung?: string;
}

export interface KPI_TieuChiChungSearchType extends SearchBase {
  ten?: string;
	parentId?: string;
	myProperty?: number;
	priority?: number;
	idBoTieuChiChung?: string;
}
