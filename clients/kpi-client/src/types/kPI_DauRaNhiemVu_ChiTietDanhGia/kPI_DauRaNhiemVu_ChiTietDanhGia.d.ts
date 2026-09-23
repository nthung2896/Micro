import { EntityType, SearchBase } from "../general";

export interface KPI_DauRaNhiemVu_ChiTietDanhGiaType extends EntityType {
  idDauRaNhiemVu: string;
	idPhieuDanhGia: string;
	vaiTroDanhGia: string;
	nguoiDanhGiaId: string;
	chamDiemSoLuong_HoanThanh: number;
	chamDiemSoLuong_KhongHoanThanh: number;
	chamDiemSoLuong_Diem: number;
	chamDiemChatLuong_KhongDat: number;
	chamDiemChatLuong_SoDiemConLai: number;
	chamDiemChatLuong_Diem: number;
	chamDiemTienDo_KhongDat: number;
	chamDiemTienDo_SoDiemConLai: number;
	chamDiemTienDo_Diem: number;
	ghiChu: string;
}

export interface KPI_DauRaNhiemVu_ChiTietDanhGiaCreateOrUpdateType {
  id?: string;
  idDauRaNhiemVu: string;
	idPhieuDanhGia: string;
	vaiTroDanhGia: string;
	nguoiDanhGiaId: string;
	chamDiemSoLuong_HoanThanh: number;
	chamDiemSoLuong_KhongHoanThanh: number;
	chamDiemSoLuong_Diem: number;
	chamDiemChatLuong_KhongDat: number;
	chamDiemChatLuong_SoDiemConLai: number;
	chamDiemChatLuong_Diem: number;
	chamDiemTienDo_KhongDat: number;
	chamDiemTienDo_SoDiemConLai: number;
	chamDiemTienDo_Diem: number;
	ghiChu: string;
}

export interface KPI_DauRaNhiemVu_ChiTietDanhGiaSearchType extends SearchBase {
  idDauRaNhiemVu?: string;
	idPhieuDanhGia?: string;
	vaiTroDanhGia?: string;
	nguoiDanhGiaId?: string;
	chamDiemSoLuong_HoanThanh?: number;
	chamDiemSoLuong_KhongHoanThanh?: number;
	chamDiemSoLuong_Diem?: number;
	chamDiemChatLuong_KhongDat?: number;
	chamDiemChatLuong_SoDiemConLai?: number;
	chamDiemChatLuong_Diem?: number;
	chamDiemTienDo_KhongDat?: number;
	chamDiemTienDo_SoDiemConLai?: number;
	chamDiemTienDo_Diem?: number;
	ghiChu?: string;
}
