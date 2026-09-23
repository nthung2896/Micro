import { EntityType, SearchBase } from "../general";

export interface KPI_CauHinhDiemTheoHeSoLanhDaoType extends EntityType {
  chucVu: string;
	heSo: number;
	idBoTieuChi?: string;
	tenBoTieuChi?: string;
}

export interface KPI_CauHinhDiemTheoHeSoLanhDaoCreateOrUpdateType {
  id?: string;
  chucVu: string;
	heSo: number;
	idBoTieuChi?: string;
}

export interface KPI_CauHinhDiemTheoHeSoLanhDaoSearchType extends SearchBase {
  chucVu?: string;
	heSo?: number;
	idBoTieuChi?: string;
  idDotDanhGia?: string | null;
  idDonVi?: string | null;
}
