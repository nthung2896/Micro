import { EntityType, SearchBase } from "../general";

export interface KPI_VanBanDenType extends EntityType {
  idVanBanDongBo: string;
	soVanBan: string;
	ngayVanBan: Date;
	trichYeu: string;
	trangThai: string;
	ngayHoanThanh: Date;
}

export interface KPI_VanBanDenCreateOrUpdateType {
  id?: string;
  idVanBanDongBo: string;
	soVanBan: string;
	ngayVanBan: Date;
	trichYeu: string;
	trangThai: string;
	ngayHoanThanh: Date;
}

export interface KPI_VanBanDenSearchType extends SearchBase {
  idVanBanDongBo?: string;
	soVanBan?: string;
	ngayVanBan?: Date;
	ngayVanBanFrom?: Date;
	ngayVanBanTo?: Date;
	trichYeu?: string;
	trangThai?: string;
	ngayHoanThanh?: Date;
	ngayHoanThanhFrom?: Date;
	ngayHoanThanhTo?: Date;
}
