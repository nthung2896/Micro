import { EntityType, SearchBase } from "../general";

export interface KPI_ThoiDiemDongBoVanBanType extends EntityType {
  idVanBan: number;
	typeVanBan: string;
	thoiGianDongBoVanBan: Date;
	isTuNhap: boolean;
}

export interface KPI_ThoiDiemDongBoVanBanCreateOrUpdateType {
  id?: string;
  idVanBan: number;
	typeVanBan: string;
	thoiGianDongBoVanBan: Date;
	isTuNhap: boolean;
}

export interface KPI_ThoiDiemDongBoVanBanSearchType extends SearchBase {
  idVanBan?: number;
	typeVanBan?: string;
	thoiGianDongBoVanBan?: Date;
	thoiGianDongBoVanBanFrom?: Date;
	thoiGianDongBoVanBanTo?: Date;
	isTuNhap?: boolean;
}
