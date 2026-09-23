
export type { RutTienKyQuySearchType } from "./dto";

export interface AssignRequest {
  id: string;
  chuyenVienId: string;
  note?: string;
}

export interface TransitionRequest {
  id: string;
  action?: string;
  statusBefore?: number;
  statusAfter: number;
  note?: string;
}

export interface RutTienKyQuySaveRequestType  {
  id?: string;
  organizationId?: string;
  tenChuQuanToChuc: string;
  soNgayNoiCapGCN?: string;
  maSoThue?: string;
  diaChiTruSoChinh?: string;
  emailTiepNhan?: string;
  sdtToChuc?: string;
  ddplHoVaTen?: string;
  ddplChucDanh?: string;
  ddplSoCccdHoChieu?: string;
  ddplDiaChi?: string;
  ddplSdt?: string;
  dmlhHoVaTen?: string;
  dmlhSdt?: string;
  webDiaChi: string;
  appTenUngDung: string;
  nganHang?: string;
  quySo?: string;
  ngay?: Date;
  lyDo?: string;
  vanBanTaiLieuKemTheo?: string;
  khoan?: string;
  dieu?: string;
  nghiDinh?: string;
  soVanBan?: string;
  diaChiNgayThangNam?: string;
}

