import { EntityType, SearchBase } from "../general";

export interface KPI_TieuChiChung_DiemSoType extends EntityType {
  idTieuChiChung: string;
	idLyLich: string;
	idDotDanhGia: string;
	diemTuCham: number;
}

export interface KPI_TieuChiChung_DiemSoCreateOrUpdateType {
  id?: string;
  idTieuChiChung: string;
	idLyLich: string;
	idDotDanhGia: string;
	diemTuCham: number;
}

export interface KPI_TieuChiChung_DiemSoSearchType extends SearchBase {
  idTieuChiChung?: string;
	idLyLich?: string;
	idDotDanhGia?: string;
	diemTuCham?: number;
}

export interface KPI_TieuChiChung_DiemSoKeThuaTreeNode {
  idTieuChiChung: string;
  stt?: string;
  ten?: string;
  diemToiDa?: number | null;
  diemTuCham: number;
  children: KPI_TieuChiChung_DiemSoKeThuaTreeNode[];
}

export interface KPI_TieuChiChung_DiemSoKeThuaSource {
  idDotDanhGia: string;
  tenDotDanhGia?: string;
  idPhieuDanhGia: string;
  tongDiemTieuChiChung: number;
  cayTieuChi: KPI_TieuChiChung_DiemSoKeThuaTreeNode[];
}

export interface KPI_TieuChiChung_DiemSoDanhSachKeThuaResponse {
  idBoTieuChiChung?: string | null;
  tenBoTieuChiChung?: string;
  danhSachNguon: KPI_TieuChiChung_DiemSoKeThuaSource[];
}

export interface KPI_TongHopTieuChiChungNhanSuDto {
  lyLichId: string;
  idPhieuDanhGia?: string;
  tenNhanSu?: string;
  chucVu?: string;
  chucVu_txt?: string;
  phongBanId?: string;
  tenPhongBan?: string;
  // Tháng
  diemTheoBTC_TrongKeHoach?: number;
  diemTheoBTC_DamNhanDotXuat?: number;
  diemTheoBTC_TongThucTe?: number;
  diemTieuChiKetQuaNV_TheoDiem?: number | null;
  diemTieuChiKetQuaNV_TheoThang?: number | null;
  duDiemNhiemVuTheoVaiTro?: boolean;
  soDauRaThieuDiem?: number;
  // Quý
  diemTieuChiKQNhiemVu_ThangThuNhat?: number;
  diemTieuChiKQNhiemVu_ThangThuHai?: number;
  diemTieuChiKQNhiemVu_ThangCuoi?: number;
  diemTieuChiKQNhiemVu_TrungBinh?: number;
  diemTieuChiChung?: number | null;
  diemTheoDoiDanhGiaQuy?: number;
  ghiChu?: string;
  daDanhGia?: boolean;
  trangThai?: string;
  chucVuPriority?: number;
}

export interface KPI_TongHopTieuChiChungDto {
  idDot?: string;
  tenDot?: string;
  donViSuDungId?: string;
  tenDonViSuDung?: string;
  phongBanId?: string;
  tenPhongBan?: string;
  listThongTinNhanSu?: KPI_TongHopTieuChiChungNhanSuDto[];
}

export interface KPI_TongHopToanCucPhongBanDto {
  phongBanId: string;
  tenPhongBan?: string;
  priority?: number;
  listThongTinNhanSu?: KPI_TongHopTieuChiChungNhanSuDto[];
}

export interface KPI_TongHopToanCucDto {
  idDot?: string;
  tenDot?: string;
  donViSuDungId?: string;
  tenDonViSuDung?: string;
  listPhongBan?: KPI_TongHopToanCucPhongBanDto[];
}

export interface KPI_TongHopTieuChiChungSearchDto {
  phongBanId?: string;
  donViSuDungId?: string;
  idDot?: string;
  quy?: number;
  nam?: number;
  type?: string;
  vaiTroDanhGia?: string;
}
