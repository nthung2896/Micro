export interface ThongKeNhomTrangThaiDto {
  daDuyet: number;
  canBoSung: number;
  tuChoi: number;
  daChamDut: number;
  choDuyet: number;
}

export interface ThongKeSoLuongTheoDiaPhuongDto {
  departmentId: string;
  departmentName: string;
  departmentCode?: string;
  nenTangTrucTuyen: ThongKeNhomTrangThaiDto;
  datHangNuocNgoai: ThongKeNhomTrangThaiDto;
  trungGianTrongNuoc: ThongKeNhomTrangThaiDto;
  trungGianNuocNgoai: ThongKeNhomTrangThaiDto;
  chungThucHopDongDienTu: ThongKeNhomTrangThaiDto;
}

export interface ThongKeSoLuongTheoDiaPhuongResultDto {
  items: ThongKeSoLuongTheoDiaPhuongDto[];
  total: ThongKeSoLuongTheoDiaPhuongDto;
}

export interface ThongKeSoLuongTheoDiaPhuongDetailItem {
  id: string;
  organizationId?: string;
  status?: number;
  statusName?: string;
  imagePath?: string;
  platformManageTypeName?: string;
  name?: string;
  domain?: string;
  companyName?: string;
  companyTaxCode?: string;
  companyEmail?: string;
  representerName?: string;
  representerMobile?: string;
  representerEmail?: string;
  createdDate?: string;
  submitDate?: string;
  reviewDate?: string;
  dateLine?: string;
  dateLineEnterprise?: string;
  processingDeadline?: string;
  overdueDays?: number;
  reviewName?: string;
  reviewMaCanBo?: string;
  merchantName?: string;
  registrationDate?: string;
  updatedDate?: string;
}

export interface ThongKeNhomXuLyHoSoDto {
  tatCa: number;
  choDuyet: number;
  daDuyetDienTu: number;
  daXacNhan: number;
  deNghiChinhSua: number;
  biTuChoi: number;
  canBoSungThongTin: number;
  daChamDutDangKy: number;
  daHuyDangKy: number;
  deNghiChamDutDangKy: number;
  daKhoa: number;
  daYeuCauGiaHan: number;
  choGiaHan: number;
  dangXinYKien: number;
  daReview: number;
  khongHopLe: number;
  canBanGiay: number;
  quaHanDonVi: number;
}

export interface ThongKeXuLyHoSoTheoDiaPhuongDto {
  departmentId: string;
  departmentName: string;
  departmentCode?: string;
  nenTangTrucTuyen: ThongKeNhomXuLyHoSoDto;
  chungThucHopDongDienTu: ThongKeNhomXuLyHoSoDto;
}

export interface ThongKeXuLyHoSoTheoDiaPhuongResultDto {
  items: ThongKeXuLyHoSoTheoDiaPhuongDto[];
  total: ThongKeXuLyHoSoTheoDiaPhuongDto;
}

export interface ThongKeTheoThoiGianDto {
  nenTangTrucTuyen: number;
  datHangNuocNgoai: number;
  trungGianTrongNuoc: number;
  trungGianNuocNgoai: number;
  chungThucHopDongDienTu: number;
  rutTienKyQuy: number;
}

export interface ThongKePhanAnhNhomDto {
  xacMinhDung: number;
  xacMinhSai: number;
  taoThanhVuViec: number;
  vuViecDung: number;
  vuViecSai: number;
}

export interface ThongKeViPhamNhomDto {
  daDangKy: number;
  chuaDangKy: number;
}

export interface ThongKePhanAnhVaViPhamDto {
  departmentId: string;
  departmentName: string;
  departmentCode?: string;
  phanAnh: ThongKePhanAnhNhomDto;
  viPham: ThongKeViPhamNhomDto;
}

export interface ThongKePhanAnhVaViPhamResultDto {
  items: ThongKePhanAnhVaViPhamDto[];
  total: ThongKePhanAnhVaViPhamDto;
}

export interface ThongKePhanAnhVaViPhamDetailItem {
  id: string;
  dataType: "phanAnh" | "viPham";
  tenNenTang?: string;
  tenUngDung?: string;
  hoTen?: string;
  email?: string;
  soCCCD?: string;
  soDienThoai?: string;
  diaChiNenTang?: string;
  lienKetTaiUngDung?: string;
  noiDungPhanAnh?: string;
  tenLoaiPhanAnh?: string;
  trangThai?: number;
  trangThaiText?: string;
  lyDoTuChoi?: string;
  tenThuongNhan?: string;
  hasVuViec?: boolean;
  vuViecId?: string;
  tenNguon?: string;
  tenLoaiViPham?: string;
  tenNenTangLienKet?: string;
  tenTinh?: string;
  createdDate?: string;
  ngayBatDau?: string;
  ngayKetThuc?: string;
  soThuTu?: number;
  ketLuanText?: string;
  isHienThi?: boolean;
}
