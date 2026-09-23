import { EntityType } from "@/types/general";
import { RutTienKyQuyHistoryType } from "@/types/rutTienKyQuy/dto";

export interface RutTienKyQuyType extends EntityType {
  tenChuQuanToChuc: string;
  soNgayNoiCapGCN?: string;
  maSoThue?: string;
  diaChiTruSoChinh?: string;
  emailTiepNhan?: string;
  organizationId?: string;
  sdtToChuc?: string;
  ddplHoVaTen?: string;
  ddplChucDanh?: string;
  ddplSoCccdHoChieu?: string;
  ddplDiaChi?: string;
  ddplSdt?: string;
  dmlhHoVaTen?: string;
  dmlhSdt?: string;
  webDiaChi?: string;
  appTenUngDung?: string;
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
  status: number;
  chuyenVienId?: string;
  chuyenVienName?: string;
  chuyenVienMaCanBo?: string;
  createdByName?: string;
  files?: TaiLieuDinhKem[];
  statusName?: string;
  histories?: RutTienKyQuyHistoryType[];
  dkkdFileLink?: string;
  organizationId?: string;
}

export interface RutTienKyQuyHistoryType extends EntityType {
  rutTienKyQuyId: string;
  senderId?: string;
  senderName?: string;
  senderMaCanBo?: string;
  action?: string;
  statusBefore: number;
  statusAfter: number;
  note?: string;
  statusBeforeName?: string;
  statusAfterName?: string;
}

export interface SpecialistDto {
  id: string;
  name?: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface RutTienKyQuySearchType {
  pageIndex?: number;
  pageSize?: number;
  keyword?: string;
  maSoThue?: string;
  tenChuQuanToChuc?: string;
  appTenUngDung?: string;
  emailTiepNhan?: string;
  chuyenVienId?: string;
  filterPermission?: string;
  status?: number;
  ddplHoVaTen?: string;
  sdtToChuc?: string;
  soVanBan?: string;
  nganHang?: string;
}

