export interface ViTienType {
  id: string;
  userId: string;
  soDuChinh: number;
  soDuKhuyenMai: number;
  tongSoDu?: number;
  tongNap: number;
  tongChi: number;
  hangThanhVien: number;
  tenHangThanhVien?: string;
  trangThai: number;
  userName?: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface TaoYeuCauNapRequestType {
  soTienNap: number;
  phuongThuc: "VIETQR" | "MOMO" | "VNPAY" | "BANK_TRANSFER";
  ghiChu?: string;
}

export interface GiaoDichNapTienType {
  id: string;
  maGiaoDich: string;
  userId: string;
  userName?: string;
  fullName?: string;
  soTienNap: number;
  tienKhuyenMai: number;
  tongNhan: number;
  phuongThuc: string;
  tenPhuongThuc?: string;
  noiDungChuyenKhoan: string;
  trangThai: number; // 0: Chờ thanh toán, 1: Thành công, 2: Thất bại, 3: Đã hủy
  tenTrangThai?: string;
  maGiaoDichDoiTac?: string;
  thoiGianThanhToan?: string;
  ghiChu?: string;
  qrCodeUrl?: string;
  createdDate: string;
}

export interface LichSuThanhToanType {
  id: string;
  maGiaoDich: string;
  userId: string;
  userName?: string;
  loaiGiaoDich: number; // 1: Nạp, 2: Khuyến mãi, 3: Chi trả, 4: Hoàn tiền, 5: Admin
  tenLoaiGiaoDich?: string;
  loaiDichVu?: number; // 1: Nâng VIP, 2: Đẩy tin, 3: Gia hạn, 4: Đăng tin
  tenLoaiDichVu?: string;
  phongTroId?: string;
  maTin?: string;
  tieuDeTin?: string;
  soTien: number;
  soDuChinhTruoc: number;
  soDuChinhSau: number;
  soDuKmTruoc: number;
  soDuKmSau: number;
  soDuSauTong?: number;
  nguonTien: number;
  noiDung: string;
  trangThai: number;
  createdDate: string;
}

export interface CauHinhKhuyenMaiType {
  id: string;
  tenChuongTrinh: string;
  loaiKhuyenMai: number;
  mucNapToiThieu: number;
  mucNapToiDa?: number;
  phanTramKhuyenMai: number;
  tienThuongCoDinh: number;
  isActive: boolean;
  thuTu: number;
  ghiChu?: string;
}

export interface ThongTinNganHangType {
  id: string;
  nganHangCode: string;
  tenNganHang: string;
  soTaiKhoan: string;
  chuTaiKhoan: string;
  chiNhanh?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface ThanhToanDichVuRequestType {
  phongTroId: string;
  loaiDichVu: number; // 1: Nâng VIP, 2: Đẩy tin, 3: Gia hạn ngày
  soTien: number;
  soNgay?: number;
  goiTin?: number;
  moTa?: string;
}

export interface KetQuaThanhToanType {
  success: boolean;
  message: string;
  soDuConLai: number;
  maGiaoDich?: string;
}
