export interface RoomListing {
  id: string;
  tieuDe: string;
  maPhong?: string;
  loaiPhong: string;
  diaChi: string;
  tenTinh: string;
  maTinh: string;
  tenHuyen: string;
  maHuyen: string;
  tenXa: string;
  maXa: string;
  dienTich: number;
  giaChoThue: number;
  tienCoc: number;
  giaDien: number;
  donViDien?: string;
  giaNuoc: number;
  donViNuoc?: string;
  giaInternet: number;
  donViInternet?: string;
  giaDichVuChung: number;
  donViDichVuChung?: string;
  giaGuiXe?: number;
  giaVeSinh?: number;
  gioGiacTuDo: boolean;
  coMayGiat: boolean;
  coDieuHoa: boolean;
  coNongLanh: boolean;
  coTuLanh: boolean;
  coGiuongTu?: boolean;
  coKeBep?: boolean;
  coBanCong: boolean;
  coThangMay: boolean;
  khongChungChu: boolean;
  coChoDeXe: boolean;
  coKhoaVanTay?: boolean;
  quyDinhGioGiac?: string;
  tienNghiKhac?: string;
  hinhAnhDaiDien: string;
  danhSachHinhAnh: string[];
  tenLienHe: string;
  soDienThoaiLienHe: string;
  zaloLienHe: string;
  goiTin: "VIP_KIMCUONG" | "VIP_1" | "VIP_2" | "THUONG";
  isNoiBat: boolean;
  ngayDang: string;
  luotXem: number;
  moTa: string;
  quyDinh?: string;
}

export interface FilterAmenities {
  dieuHoa: boolean;
  mayGiat: boolean;
  nongLanh: boolean;
  gioTuDo: boolean;
  tuLanh: boolean;
  banCong: boolean;
}

export type SortTabType = "dexuat" | "moidang" | "giare" | "video";
