export interface ThongKeDiemNhanSuType {
  idLyLich: string;
  userId?: string | null;
  hoTen?: string | null;
  chucVuCode?: string | null;
  chucVuName?: string | null;
  idPhieuDanhGia: string;
  idDotDanhGia: string;
  tenDotDanhGia?: string | null;
  diemTieuChiChung?: number | null;
  diemTieuChiKetQua?: number | null;
  tongDiem?: number | null;
  duDiemNhiemVuTheoVaiTro?: boolean;
  soDauRaThieuDiem?: number;
}

export interface PhongBanSoSanhType {
  id: string;
  name: string;
}

export interface PhamViSoSanhNhanSuType {
  theoDonViSuDung: boolean;
}

export interface NhanSuSoSanhType {
  idLyLich: string;
  userId?: string | null;
  hoTen: string;
  phongBanId: string;
  phongBanName: string;
}

export interface SoSanhDiemNhanSuRequestType {
  phongBanNhanSu1Id?: string;
  phongBanNhanSu2Id?: string;
  idLyLichNhanSu1: string;
  idLyLichNhanSu2: string;
  idDotDanhGia: string;
}

export interface SoSanhTieuChiType {
  tenTieuChiChung: string;
  diemToiDaTieuChiChung: number;
  tenTieuChiKetQua: string;
  diemToiDaTieuChiKetQua: number;
}

export interface SoSanhDiemNhanSuItemType {
  idLyLich: string;
  hoTen: string;
  phongBanId: string;
  phongBanName: string;
  idPhieuDanhGia?: string | null;
  diemTieuChiChung: number;
  diemTieuChiKetQua: number;
  diemBoTieuChi: number;
  diemHeSoLanhDao?: number | null;
  diemSoLuong: number;
  diemChatLuong: number;
  diemTienDo: number;
  tongDiem: number;
}

export interface SoSanhDiemNhanSuType {
  tenDotDanhGia?: string | null;
  duDuLieuSoSanh: boolean;
  thieuDuLieuNhanSuIds: string[];
  nhanSu1?: SoSanhDiemNhanSuItemType | null;
  nhanSu2?: SoSanhDiemNhanSuItemType | null;
  tieuChi: SoSanhTieuChiType;
}
