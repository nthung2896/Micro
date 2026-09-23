import { SearchBase } from "@/types/general";
export interface PlatformManageCreateRequestType {
  mauSo?: string;
  name: string;
  domain: string;
  companyName: string;
  companyTaxCode: string;
  platformManageTypeId: string;
  organizationId?: string;
  typeOrganization?: string;
  platformType?: string;
  availabilityType?: number;
  chucNangNenTang?: string;
  representerName?: string;
  representerCCCD?: string;
  representerDiaChi?: string;
  representerMobile?: string;
  representerEmail?: string;
  status?: number;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  websiteNumber?: string;
  representerJob?: string;
  ispId?: string;
  staffNumber?: number;
  uRLApp?: string;
  appOS?: string;
  loaiHangHoaKhac?: string;
  phuongThucLienHe?: string;
  detail?: string;
  isNuocNgoai?: boolean;
  representerNameDaiDien?: string;
  representerJobDaiDien?: string;
  representerCCCDDaiDien?: string;
  addressDaiDien?: string;
  representerEmailDaiDien?: string;
  representerMobileDaiDien?: string;
  phuongThucLienHeDaiDien?: string;
  representerNameOnline?: string;
  representerJobOnline?: string;
  representerCCCD?: string;
  representerCCCDOnline?: string;
  addressOnline?: string;
  representerDiaChiOnline?: string;
  representerMobileOnline?: string;
  representerEmailOnline?: string;
  phuongThucLienHeOnline?: string;

  // --- 9.4.1. Thông tin đại diện được chỉ định theo uỷ quyền tại Việt Nam ---
  representerNameUyQuyen?: string;
  representerJobUyQuyen?: string;
  representerCCCDUyQuyen?: string;
  representerDiaChiUyQuyen?: string;
  representerMobileUyQuyen?: string;
  representerEmailUyQuyen?: string;

  domainAdd?: string;
  chuSoHuu?: string;
  logo?: string;
  domainOwner?: string;
  userApp?: string;
  seal?: string;
  ispIdKhac?: string;
  appIconPath?: string;
  tinhId?: string;
  huyenId?: string;
  xaId?: string;
  quocGiaId?: string;
  ngonNgu?: string;
  chinhSachBaoMat?: string;
  tiepNhanKhieuNai?: string;
  chinhSachGia?: string;
  chinhSachThanhToan?: string;
  dieuKienCungCap?: string;
  chinhSachGiaoHang?: string;

  // --- 7.1. Các chính sách bổ sung theo yêu cầu mới ---
  phuongThucGiaiQuyetPhanAnh?: string;
  dieuKienOrHanCheCungCapHHDV?: string;
  chinhSachApDungHHDV?: string;
  hinhThucHoTroTrucTuyen?: string;

  websiteNumberSo?: string;
  websiteNumberNgay?: Date;
  websiteNumberNoiCap?: string;
  representerJobDaiDienSo?: string;
  representerJobDaiDienNgay?: Date;
  representerJobDaiDienNoiCap?: string;
  // Đại diện pháp luật bổ sung (Mau04 — nền tảng trung gian nước ngoài)
  representerCCCDDL?: string;
  representerMobileDL?: string;
  representerEmailDL?: string;
  addressDL?: string;
  // Người quản lý hoạt động TMĐT
  qlHdtmdt_HoTen?: string;
  qlHdtmdt_ChucDanh?: string;
  qlHdtmdt_CCCD?: string;
  qlHdtmdt_SDT?: string;
  qlHdtmdt_Email?: string;
  qlHdtmdt_DiaChi?: string;
  // Người quản lý khiếu nại
  qlKhieuNai_HoTen?: string;
  qlKhieuNai_ChucDanh?: string;
  qlKhieuNai_CCCD?: string;
  qlKhieuNai_SDT?: string;
  qlKhieuNai_Email?: string;
  qlKhieuNai_DiaChi?: string;
  // Pháp nhân được chỉ định (Mau04)
  phapNhanChiDinh_HoTen?: string;
  phapNhanChiDinh_CCCD?: string;
  phapNhanChiDinh_SDT?: string;
  phapNhanChiDinh_Email?: string;
  phapNhanChiDinh_DiaChi?: string;
  // Web logo
  imagePath?: string;

  // --- 9.5. Nhân sự chịu trách nhiệm quản lý, vận hành Hệ thống tiếp nhận và giải quyết phản ánh... ---
  representerNameVanHanh?: string;
  representerJobVanHanh?: string;
  representerCCCDVanHanh?: string;
  representerDiaChiVanHanh?: string;
  representerMobileVanHanh?: string;
  representerEmailVanHanh?: string;

  // --- 9.6. Thông tin pháp nhân ủy quyền tại Việt Nam (Cho Nền tảng Nước ngoài) ---
  organizationNameUyQuyen?: string;
  organizationCodeUyQuyen?: string;
  organizationFileDangKyUyQuyen?: string;
  organizationDiaChiUyQuyen?: string;
  organizationEmailUyQuyen?: string;

  // --- 9.7. Đầu mối liên hệ ủy quyền (Cho Nền tảng Nước ngoài) ---
  representerNameDauMoiUyQuyen?: string;
  representerJobDauMoiUyQuyen?: string;
  representerCCCDDauMoiUyQuyen?: string;
  representerDiaChiDauMoiUyQuyen?: string;
  representerMobileDauMoiUyQuyen?: string;
  representerEmailDauMoiUyQuyen?: string;

  // Thông tin mở rộng (Decoupled)
  appInfoItems?: AppInfoItemCreateType[];
  productCategoryCodes?: string[];
  listFileIds?: string[];
}

export interface AppInfoItemCreateType {
  appName?: string;
  osCode?: string;
  appLink?: string;
  appLogo?: string;
}

export interface PlatformManageOnlineBookingCreateRequestType {
  companyName: string;
  websiteNumber?: string;
  companyAddress?: string;
  name: string;
  domain: string;
  imagePath?: string;
  iSPId?: string;
  uRLApp?: string;
  loaiHangHoaKhac?: string;
  phuongThucLienHe?: string;
  phuongThucLienHeOnline?: string;
  representerName: string;
  representerJob?: string;
  representerCCCD?: string;
  addressDaiDien?: string;
  representerMobile: string;
  representerEmail?: string;
  representerNameOnline?: string;
  representerJobOnline?: string;
  representerMobileOnline?: string;
  representerEmailOnline?: string;
  addressOnline?: string;
}

export interface PlatformManageOnlineBookingUpdateRequestType {
  id: string;
}

export interface PlatformManageSearchType extends SearchBase {
  keyword?: string;
  name?: string;
  companyName?: string;
  companyTaxCode?: string;
  domain?: string;
  representerName?: string;
  representerMobile?: string;
  status?: number;
  platformManageTypeId?: string;
  reviewId?: string;
  submitDateFrom?: string;
  submitDateTo?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
  submitDateRange?: [any, any];
  createdDateRange?: [any, any];
  currentUserId?: string;
  currentRoles?: string[];
  FilterPermission?: string;
  onlyPending?: boolean;
  isNenTangLon?: boolean;
  Month?: number;
  Year?: number;
  SpecialistId?: string;
  tinhId?: string;
}

export interface PlatformManageUpdateRequestType {
  id: string;
}

export interface PlatformTransitionRequestType {
  id: string;
  targetStatus: number;
  note?: string;
}

export interface PlatformBulkTransitionRequestType {
  ids: string[];
  targetStatus: number;
  note?: string;
}

export interface ReceiveProcessingRequestType {
  ids: string[];
}

export type PlatformManageCreateRequestType = PlatformManageCreateType;

/** Request tạo/sửa nền tảng trực tuyến (CreateOnlineBooking / UpdateOnlineBooking) */
export interface PlatformManageOnlineBookingCreateType {
  id?: string;
  companyName?: string;
  companyTaxCode?: string;
  status?: number;
  websiteNumber?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  name?: string;
  domain?: string;
  domainOwner?: string;
  logo?: string;
  imagePath?: string;
  appIconPath?: string;
  ispId?: string;
  urlApp?: string;
  appOS?: string;
  loaiHangHoaKhac?: string;
  phuongThucLienHe?: string;
  phuongThucLienHeOnline?: string;
  ngonNgu?: string;
  chinhSachBaoMat?: string;
  tiepNhanKhieuNai?: string;
  chinhSachGia?: string;
  chinhSachThanhToan?: string;
  dieuKienCungCap?: string;
  chinhSachGiaoHang?: string;
  chucNangNenTang?: string;
  representerName?: string;
  representerJob?: string;
  representerCCCD?: string;
  representerDiaChi?: string;
  addressDaiDien?: string;
  representerMobile?: string;
  representerEmail?: string;
  representerNameOnline?: string;
  representerJobOnline?: string;
  representerCCCDOnline?: string;
  addressOnline?: string;
  representerDiaChiOnline?: string;
  representerMobileOnline?: string;
  representerEmailOnline?: string;

  // --- 9.4.1. Thông tin đại diện được chỉ định theo uỷ quyền tại Việt Nam ---
  representerNameUyQuyen?: string;
  representerJobUyQuyen?: string;
  representerCCCDUyQuyen?: string;
  representerDiaChiUyQuyen?: string;
  representerMobileUyQuyen?: string;
  representerEmailUyQuyen?: string;

  // Thông tin mở rộng (Decoupled)
  appInfoItems?: AppInfoItemCreateType[];
  productCategoryCodes?: string[];
  mauSo?: string;
  listFileIds?: string[];
}

export interface PlatformManageOnlineBookingUpdateType extends PlatformManageOnlineBookingCreateType {
  id: string;
}
